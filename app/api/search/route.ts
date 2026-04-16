/**
 * POST /api/search
 *
 * Accepts a natural language query from the TypeScout search input.
 * Pipeline:
 *   1. Send query to Claude (claude-sonnet-4-6) with the full tag taxonomy
 *   2. Parse Claude's structured JSON response into a SearchTags object
 *   3. Build a GROQ query from the non-empty tag arrays
 *   4. Execute the GROQ query against Sanity
 *   5. Return matched typefaces as JSON
 *
 * Required env vars: ANTHROPIC_API_KEY, NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 */

import Anthropic from "@anthropic-ai/sdk";
import { client } from "@/lib/sanity";
import type { SearchTags, TypefaceResult } from "@/lib/types";
import {
  CLASSIFICATION,
  PERSONALITY_TAGS,
  USE_CASE_TAGS,
  CONTRAST,
  WEIGHT_RANGE,
  ERA_TAGS,
} from "@/lib/taxonomy";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── System prompt ────────────────────────────────────────────────────────────
// Vocabulary is derived from lib/taxonomy.ts — the single source of truth.
// To add or rename a tag, edit taxonomy.ts only.

const SYSTEM_PROMPT = `You are the TypeScout search engine. Given a natural language query from a designer, extract relevant search tags and return ONLY a valid JSON object with these fields: classification (array), personalityTags (array), useCaseTags (array), contrast (array), weightRange (array), era (array), foundryQuery (string). Match tags strictly to the controlled vocabulary below. Return an empty array for any dimension you cannot confidently match. Return an empty string for foundryQuery if no foundry or location is mentioned. No explanation, no markdown, only JSON.

CONTROLLED VOCABULARY:

classification (use lowercase values):
${CLASSIFICATION.join(', ')}

personalityTags (use exact capitalisation):
${PERSONALITY_TAGS.join(', ')}

useCaseTags (use exact capitalisation):
${USE_CASE_TAGS.join(', ')}

contrast (use lowercase values):
${CONTRAST.join(', ')}

weightRange (use lowercase values):
${WEIGHT_RANGE.join(', ')}

era (use exact capitalisation):
${ERA_TAGS.join(', ')}

foundryQuery (plain string — not an array):
Extract any mentioned foundry name (e.g. "Klim", "Grilli Type"), designer name, or geographic origin (e.g. "Barcelona", "Switzerland", "Swedish", "Scandinavian"). Use the most specific term from the query. Empty string if none mentioned.

Example output for "bold high contrast font for a canned coffee company":
{"classification":["display","sans-serif"],"personalityTags":["Rugged","Expressive"],"useCaseTags":["Branding","Packaging"],"contrast":["high"],"weightRange":["bold","extrabold","black"],"era":[],"foundryQuery":""}

Example output for "something elegant from a Barcelona foundry":
{"classification":[],"personalityTags":["Elegant"],"useCaseTags":[],"contrast":[],"weightRange":[],"era":[],"foundryQuery":"Barcelona"}`;

// ── GROQ projection ──────────────────────────────────────────────────────────
const TYPEFACE_PROJECTION = `{
  _id,
  name,
  "foundry": foundry->{name, slug, location},
  specimenImage,
  specimenImageHeavy,
  editorialNote,
  classification,
  subClassification,
  personalityTags,
  useCaseTags,
  weightRange,
  contrast,
  era,
  licensing,
  platforms,
  variableFont,
  multilingualSupport,
  typefaceURL,
  featured
}`;

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // 1. Parse request body
  let query: string;
  try {
    const body = (await request.json()) as { query?: unknown };
    if (typeof body.query !== "string" || body.query.trim().length === 0) {
      return Response.json(
        { error: "Request body must include a non-empty `query` string." },
        { status: 400 }
      );
    }
    query = body.query.trim();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 2. Call Claude to extract structured tags
  let tags: SearchTags;
  try {
    const message = await anthropic.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: query }],
      },
      {
        headers: { "anthropic-beta": "prompt-caching-2024-07-31" },
      }
    );

    const rawContent = message.content[0];
    if (rawContent.type !== "text") {
      throw new Error("Unexpected Claude response type.");
    }

    const jsonText = rawContent.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText) as Partial<SearchTags>;
    tags = {
      classification: Array.isArray(parsed.classification)
        ? parsed.classification
        : [],
      personalityTags: Array.isArray(parsed.personalityTags)
        ? parsed.personalityTags
        : [],
      useCaseTags: Array.isArray(parsed.useCaseTags)
        ? parsed.useCaseTags
        : [],
      contrast: Array.isArray(parsed.contrast) ? parsed.contrast : [],
      weightRange: Array.isArray(parsed.weightRange)
        ? parsed.weightRange
        : [],
      era: Array.isArray(parsed.era) ? parsed.era : [],
      foundryQuery: typeof parsed.foundryQuery === 'string' ? parsed.foundryQuery : '',
    };
  } catch (err) {
    console.error("[TypeScout] Claude API error:", err);
    return Response.json(
      { error: "Search interpretation failed. Check ANTHROPIC_API_KEY." },
      { status: 502 }
    );
  }

  // 3. Build GROQ filter dynamically — only include conditions for non-empty
  //    tag arrays so an empty response doesn't return zero results.
  const conditions: string[] = [];

  if (tags.classification.length > 0)
    conditions.push('count((classification)[@ in $classification]) > 0');
  if (tags.personalityTags.length > 0)
    conditions.push('count((personalityTags)[@ in $personalityTags]) > 0');
  if (tags.useCaseTags.length > 0)
    conditions.push('count((useCaseTags)[@ in $useCaseTags]) > 0');
  if (tags.contrast.length > 0)
    conditions.push('count((contrast)[@ in $contrast]) > 0');
  // weightRange is intentionally excluded from GROQ conditions — Claude infers
  // weights from aesthetic context, which is too imprecise for a hard AND filter.
  // Weight is surfaced as card metadata only.
  if (tags.era.length > 0)
    conditions.push('count((era)[@ in $era]) > 0');
  if (tags.foundryQuery.length > 0)
    conditions.push('(foundry->name match $foundryQuery || foundry->location match $foundryQuery || count((rawKeywords)[@ match $foundryQuery]) > 0)');

  // If Claude returned nothing useful, fall back to featured typefaces.
  // Conditions between dimensions use AND — a result must satisfy every
  // non-empty dimension. Within each dimension the GROQ already uses OR
  // (any matching value in the array qualifies).
  const filter =
    conditions.length > 0
      ? `_type == "typeface" && ${conditions.join(" && ")}`
      : `_type == "typeface"`;

  const groqQuery = `*[${filter}] | order(name asc) ${TYPEFACE_PROJECTION}`;

  // 4. Execute GROQ query against Sanity
  let results: TypefaceResult[];
  try {
    results = await client.fetch<TypefaceResult[]>(groqQuery, {
      classification: tags.classification,
      personalityTags: tags.personalityTags,
      useCaseTags: tags.useCaseTags,
      contrast: tags.contrast,
      weightRange: tags.weightRange,
      era: tags.era,
      foundryQuery: tags.foundryQuery,
    });
  } catch (err) {
    console.error("[TypeScout] Sanity query error:", err);
    return Response.json(
      {
        error:
          "Database query failed. Check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN.",
      },
      { status: 502 }
    );
  }

  // 5. Score and rank results by tag overlap with the extracted query.
  //    Dimensions are weighted by how strongly they signal designer intent:
  //    personalityTags and useCaseTags are the most expressive (2pts each match),
  //    classification/era/contrast are broader signals (1pt each match).
  //    featured adds a small editorial quality bump.
  function score(result: TypefaceResult): number {
    let s = 0;
    if (tags.classification.length > 0)
      s += result.classification.filter(v => tags.classification.includes(v)).length * 1;
    if (tags.personalityTags.length > 0)
      s += (result.personalityTags ?? []).filter(v => tags.personalityTags.includes(v)).length * 2;
    if (tags.useCaseTags.length > 0)
      s += (result.useCaseTags ?? []).filter(v => tags.useCaseTags.includes(v)).length * 2;
    if (tags.contrast.length > 0)
      s += (result.contrast ?? []).filter(v => tags.contrast.includes(v)).length * 1;
    if (tags.era.length > 0)
      s += (result.era ?? []).filter(v => tags.era.includes(v)).length * 1;
    if (result.featured) s += 1;
    return s;
  }

  results.sort((a, b) => score(b) - score(a));

  return Response.json({ results, tags });
}
