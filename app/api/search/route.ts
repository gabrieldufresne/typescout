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
  WIDTH,
  ERA_TAGS,
} from "@/lib/taxonomy";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── System prompt ────────────────────────────────────────────────────────────
// Vocabulary is derived from lib/taxonomy.ts — the single source of truth.
// To add or rename a tag, edit taxonomy.ts only.

const SYSTEM_PROMPT = `You are the TypeScout search engine. Given a natural language query from a designer, extract relevant search tags and return ONLY a valid JSON object with these fields: classification (array), personalityTags (array), useCaseTags (array), contrast (array), weightRange (array), width (array), era (array), foundryQuery (string). Match tags strictly to the controlled vocabulary below. Return an empty array for any dimension you cannot confidently match. Return an empty string for foundryQuery if no foundry or location is mentioned. No explanation, no markdown, only JSON.

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

width (use lowercase values):
${WIDTH.join(', ')}

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
  "slug": slug.current,
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
  width,
  era,
  licensing,
  platforms,
  variableFont,
  hasItalics,
  multilingualSupport,
  typefaceURL,
  featured,
  rawKeywords
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
      width: Array.isArray(parsed.width) ? parsed.width : [],
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

  // Pre-flight foundry check — runs only when Claude didn't extract a foundry name.
  // Checks the raw query directly against foundry names and rawKeywords in Sanity.
  // This catches queries like "Pangram" or "CoType" that Claude won't recognise as foundries.
  if (!tags.foundryQuery) {
    const foundryMatch = await client.fetch<{ name: string } | null>(
      `*[_type == "foundry" && name match $q][0]{ name }`,
      { q: query }
    );
    if (foundryMatch?.name) {
      tags.foundryQuery = foundryMatch.name;
    } else {
      // Also check rawKeywords — catches alternate foundry spellings like "PangramPangram"
      const keywordMatch = await client.fetch<{ foundryName: string } | null>(
        `*[_type == "typeface" && count((rawKeywords)[@ match $q]) > 0][0]{
          "foundryName": foundry->name
        }`,
        { q: query }
      );
      if (keywordMatch?.foundryName) {
        tags.foundryQuery = keywordMatch.foundryName;
      }
    }
  }

  // 3. Build GROQ filter dynamically — only include conditions for non-empty
  //    tag arrays so an empty response doesn't return zero results.
  const conditions: string[] = [];

  if (tags.classification.length > 0)
    conditions.push('count((classification)[@ in $classification]) > 0');
  // variableFont and licensing are boolean/enum fields outside the tag vocabulary.
  // Detect them directly from the raw query string.
  if (/\bvariable\b/i.test(query))
    conditions.push('variableFont == true');
  if (/\bslanted\b|\bitalic(s)?\b|\boblique\b|\bslant\b/i.test(query))
    conditions.push('hasItalics == true');
  if (/\bgoogle\s*fonts?\b/i.test(query))
    conditions.push('"google-fonts" in platforms');
  if (/\badobe\s*fonts?\b/i.test(query))
    conditions.push('"adobe-fonts" in platforms');
  if (/\bfree\b/i.test(query))
    conditions.push('licensing == "free"');
  if (tags.personalityTags.length > 0)
    conditions.push('count((personalityTags)[@ in $personalityTags]) > 0');
  if (tags.useCaseTags.length > 0)
    conditions.push('count((useCaseTags)[@ in $useCaseTags]) > 0');
  if (tags.contrast.length > 0)
    conditions.push('count((contrast)[@ in $contrast]) > 0');
  // weightRange is intentionally excluded from GROQ conditions — Claude infers
  // weights from aesthetic context, which is too imprecise for a hard AND filter.
  // Weight is surfaced as card metadata only.
  if (tags.width.length > 0)
    conditions.push('width in $width');
  if (tags.era.length > 0)
    conditions.push('count((era)[@ in $era]) > 0');
  // foundryQuery is intentionally excluded from GROQ conditions — it acts as a
  // scoring boost only (+5pts in the score function below). This prevents
  // geographic project context like "a montreal cultural magazine" from being
  // treated as a hard foundry-origin filter and zeroing out otherwise strong matches.

  // foundryQuery is intentionally excluded from GROQ conditions — it acts as
  // a scoring boost only (+5pts in the score function). Typeface character and
  // aesthetic fit (tags) always determines what gets fetched; foundry origin
  // only influences ranking within those results.
  // When Claude extracts no tags (unusual/abstract queries), fall back to a
  // rawKeywords full-text match so the search doesn't return the entire catalogue.
  // rawKeywords is NOT added as a general OR alongside tag conditions — that
  // caused the false-positive problem (Flint Script in "berlin nightclub") that
  // we fixed by reverting the foundry rescue OR.
  // Name/slug OR — ensures typefaces whose name or slug matches the raw query
  // are always included, even if Claude's tag extraction doesn't match their
  // formal tags. Searching "Copernicus" or "Obbligato" directly will always
  // surface the typeface regardless of what tags Claude inferred from the query.
  const nameMatchCondition = `(name match $rawQuery || slug.current match $rawQuery)`;

  const filter =
    conditions.length > 0
      ? `_type == "typeface" && !(_id in path("drafts.**")) && (${conditions.join(" && ")} || ${nameMatchCondition})`
      : `_type == "typeface" && !(_id in path("drafts.**")) && (${nameMatchCondition} || count((rawKeywords)[@ match $rawQuery]) > 0)`;

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
      width: tags.width,
      era: tags.era,
      foundryQuery: tags.foundryQuery,
      rawQuery: query,
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
  function extractEditorialText(editorialNote: unknown): string {
    if (typeof editorialNote === 'string') return editorialNote;
    if (!Array.isArray(editorialNote)) return '';
    return (editorialNote as Array<{ children?: Array<{ text?: string }> }>)
      .flatMap(block => (block.children ?? []).map(span => span.text ?? ''))
      .join(' ');
  }

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
    if (tags.width.length > 0)
      s += (result.width && tags.width.includes(result.width)) ? 2 : 0;
    if (tags.era.length > 0)
      s += (result.era ?? []).filter(v => tags.era.includes(v)).length * 1;
    if (result.featured) s += 1;
    // Name / text match bonus — floats direct name hits above tag coincidences.
    const rq = query.toLowerCase();
    const nameLower = (result.name ?? '').toLowerCase();
    if (nameLower === rq) s += 10;
    else if (nameLower.includes(rq) || rq.includes(nameLower)) s += 6;
    // Foundry match — strong signal, floats foundry-specific queries to the top.
    // 5pts outweighs typical tag-match scores so a direct foundry search
    // surfaces that foundry's typefaces before unrelated tag coincidences.
    if (tags.foundryQuery.length > 0) {
      const fq = tags.foundryQuery.toLowerCase();
      const foundryName = (result.foundry?.name ?? '').toLowerCase();
      const foundryLocation = (result.foundry?.location ?? '').toLowerCase();
      const keywords = (result.rawKeywords ?? []).map((k: string) => k.toLowerCase());
      if (
        foundryName.includes(fq) ||
        fq.includes(foundryName) ||
        foundryLocation.includes(fq) ||
        keywords.some((k: string) => k.includes(fq))
      ) {
        s += 5;
      }
    }
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    if (queryWords.length > 0) {
      const keywords = (result.rawKeywords ?? []).map((k: string) => k.toLowerCase());
      const matchCount = queryWords.filter(word =>
        keywords.some(kw => kw.includes(word) || word.includes(kw))
      ).length;
      s += matchCount * 2;
    }
    // subClassification boost — this field contains highly specific typographic
    // descriptors ("Condensed Flared Serif", "Medieval Modernist Display", etc.)
    // that capture concepts not covered by the tag taxonomy. Matching query words
    // against it surfaces typefaces for precise typographic terms like "flared",
    // "inscriptional", "stencil", "inline", etc.
    const subClass = (result.subClassification ?? '').toLowerCase();
    if (subClass) {
      const subClassWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const subClassHits = subClassWords.filter(w => subClass.includes(w)).length;
      s += subClassHits * 4;
    }
    // Editorial note — richest semantic description of the typeface.
    // Match query words against the full editorial prose to surface typefaces
    // whose character is described in the note but not captured by formal tags.
    // Weight is conservative (1pt/word) since prose has more incidental matches
    // than structured tag fields.
    const editorialText = extractEditorialText(result.editorialNote).toLowerCase();
    if (editorialText && queryWords.length > 0) {
      const editorialHits = queryWords.filter(w => editorialText.includes(w)).length;
      s += editorialHits * 1;
    }
    return s;
  }

  const scored = results
    .map(r => ({ ...r, _score: score(r) }))
    .sort((a, b) => b._score - a._score);

  // Score gap filter — when a clearly strong match exists (topScore ≥ 8),
  // drop results that fall more than 6 points below the top score.
  // This prevents over-broad tag matches (e.g. display + Expressive + high contrast)
  // from flooding results alongside a handful of genuinely specific matches.
  // For low-scoring queries (topScore < 8), return everything rather than risk
  // returning nothing.
  const topScore = scored[0]?._score ?? 0;
  const GAP_LIMIT = 6;
  const finalResults = topScore >= 8
    ? scored.filter(r => r._score >= topScore - GAP_LIMIT)
    : scored;

  // Secondary query — OR-logic across tag dimensions, excludes primary results.
  let secondaryResults: TypefaceResult[] = [];
  const hasTagSignal =
    tags.classification.length > 0 ||
    tags.personalityTags.length > 0 ||
    tags.useCaseTags.length > 0;

  if (finalResults.length > 0 && hasTagSignal) {
    try {
      const excludeIds = finalResults.map(r => r._id);
      const secondaryGroq = `*[
        _type == "typeface" &&
        !(_id in path("drafts.**")) &&
        !(_id in $excludeIds) &&
        (
          count((classification)[@ in $classification]) > 0 ||
          count((personalityTags)[@ in $personalityTags]) > 0 ||
          count((useCaseTags)[@ in $useCaseTags]) > 0 ||
          count((contrast)[@ in $contrast]) > 0 ||
          count((era)[@ in $era]) > 0
        )
      ] | order(name asc) ${TYPEFACE_PROJECTION}`;

      const secondaryRaw = await client.fetch<TypefaceResult[]>(secondaryGroq, {
        excludeIds,
        classification: tags.classification,
        personalityTags: tags.personalityTags,
        useCaseTags: tags.useCaseTags,
        contrast: tags.contrast,
        era: tags.era,
      });

      secondaryResults = secondaryRaw
        .map(r => ({ ...r, _score: score(r) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 4);
    } catch (err) {
      console.error('[TypeScout] Secondary query error:', err);
      secondaryResults = [];
    }
  }

  // Log the query to Sanity — fire-and-forget so a write failure never
  // blocks or breaks the search response.
  client.create({
    _type: 'searchLog',
    query,
    resultCount: finalResults.length,
    tags,
    searchedAt: new Date().toISOString(),
  }).catch((err) => console.error('[TypeScout] Search log write failed:', err));

  return Response.json({ results: finalResults, secondaryResults, tags });
}
