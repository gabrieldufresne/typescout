/**
 * intake-google-fonts.js
 *
 * Scrapes a Google Fonts specimen page and generates a pre-filled intake-data.js.
 * Google Fonts is always JS-rendered — Playwright is used automatically.
 * All predictable fields are auto-filled; fields requiring editorial judgment
 * are marked with TODO comments.
 *
 * Usage:
 *   npm run intake:gf -- --url "https://fonts.google.com/specimen/Public+Sans"
 *   npm run intake:gf -- --url "https://fonts.google.com/specimen/DM+Sans" --foundry foundry-google
 *
 * Options:
 *   --url <url>          Google Fonts specimen URL (required)
 *   --foundry <id>       Existing foundry _id (e.g. foundry-uswds) — omit to scaffold a new one
 *
 * Output:
 *   Overwrites scripts/intake-data.js with a pre-filled draft.
 *   Review all TODO items, then: npm run push
 */

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const inputUrl         = getArg('--url');
const existingFoundryArg = getArg('--foundry'); // e.g. 'foundry-uswds' or just 'uswds'

if (!inputUrl || !inputUrl.includes('fonts.google.com/specimen/')) {
  console.error('\nUsage: npm run intake:gf -- --url "https://fonts.google.com/specimen/Font+Name" [--foundry <foundry-id>]\n');
  process.exit(1);
}

// Normalise foundry arg — accept with or without 'foundry-' prefix
const existingFoundryId = existingFoundryArg
  ? (existingFoundryArg.startsWith('foundry-') ? existingFoundryArg : `foundry-${existingFoundryArg}`)
  : null;

// Derive foundry slug for specimen filenames (strip 'foundry-' prefix)
const foundrySlugForSpecimen = existingFoundryId
  ? existingFoundryId.replace(/^foundry-/, '')
  : null;

// ── Controlled vocabulary mappings ───────────────────────────────────────────

// Google Fonts mood tags → TypeScout personalityTags
// Each mood can suggest multiple personality tags. The final list is de-duped
// and trimmed to the most relevant 4-5 for the typeface.
const MOOD_TO_PERSONALITY = {
  'Calm':      ['Refined', 'Neutral', 'Approachable'],
  'Business':  ['Functional', 'Authoritative', 'Sophisticated'],
  'Elegant':   ['Elegant', 'Refined', 'Sophisticated'],
  'Playful':   ['Playful', 'Quirky', 'Approachable'],
  'Loud':      ['Loud', 'Expressive', 'Bold'],
  'Rugged':    ['Rugged', 'Bold'],
  'Dramatic':  ['Expressive', 'Loud'],
  'Stiff':     ['Serious', 'Functional'],
  'Friendly':  ['Warm', 'Approachable'],
  'Serious':   ['Serious', 'Authoritative'],
  'Vintage':   [], // Vintage contributes to era, not personality
};

// Google Fonts classification tag → TypeScout classification array
const CLASSIFICATION_MAP = {
  'Sans Serif':  ['sans-serif'],
  'Serif':       ['serif'],
  'Display':     ['display'],
  'Handwriting': ['script'],
  'Monospace':   ['monospace'],
};

// Google Fonts sub-tags that appear on specimen pages
// Ordered from most specific to most generic. Humanist and Geometric are
// precise design classifications; Grotesque is broad and appears in historical
// descriptions of many sans-serifs even when it's not the correct classification.
const KNOWN_SUB_TAGS = [
  'Humanist', 'Geometric', 'Neo-Grotesque', 'Slab',
  'Transitional', 'Old Style', 'Monospaced', 'Grotesque',
];

// CSS font-weight number → TypeScout weightRange vocabulary
const WEIGHT_NUMBER_MAP = {
  100: 'thin',
  200: 'light',   // ExtraLight maps to light
  300: 'light',
  400: 'regular',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
  800: 'extrabold',
  900: 'black',
};

// Named weight string → TypeScout weightRange vocabulary
const WEIGHT_NAME_MAP = {
  'thin':       'thin',
  'extralight': 'light',
  'extra-light':'light',
  'light':      'light',
  'regular':    'regular',
  'medium':     'medium',
  'semibold':   'semibold',
  'semi-bold':  'semibold',
  'bold':       'bold',
  'extrabold':  'extrabold',
  'extra-bold': 'extrabold',
  'black':      'black',
  'heavy':      'black',
};

// Ordered weight scale for range-filling
const WEIGHT_ORDER = ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function unique(arr) {
  return [...new Set(arr)];
}

function jsArray(arr) {
  if (!arr || arr.length === 0) return '[]';
  return `[${arr.map(v => `'${v}'`).join(', ')}]`;
}

function escapeStr(str) {
  return (str || '').replace(/'/g, "\\'");
}

function parseWeightRange(text) {
  const weights = new Set();

  // Strategy 1: explicit weight numbers
  const numericMatches = text.match(/\b(100|200|300|400|500|600|700|800|900)\b/g) || [];
  numericMatches.forEach(n => {
    const w = WEIGHT_NUMBER_MAP[parseInt(n)];
    if (w) weights.add(w);
  });

  // Strategy 2: named weight strings
  for (const [name, val] of Object.entries(WEIGHT_NAME_MAP)) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) {
      weights.add(val);
    }
  }

  // Strategy 3: if we see "Thin ... Black" range, fill in all intermediate weights
  const hasFullRange = weights.has('thin') && weights.has('black');
  const found = WEIGHT_ORDER.filter(w => weights.has(w));

  if (hasFullRange) return WEIGHT_ORDER;
  if (found.length > 0) return found;

  // Strategy 4: infer from style count (rough heuristic)
  const styleCountMatch = text.match(/(\d+)\s+styles?/i);
  if (styleCountMatch) {
    const count = parseInt(styleCountMatch[1]);
    // Google Fonts with italics typically doubles the count (9 weights + 9 italics = 18)
    const weightCount = Math.ceil(count / 2);
    if (weightCount >= 8) return WEIGHT_ORDER;
    if (weightCount >= 5) return ['light', 'regular', 'medium', 'bold', 'black'];
    if (weightCount >= 3) return ['light', 'regular', 'bold'];
    if (weightCount === 2) return ['regular', 'bold'];
  }

  return ['regular']; // safe fallback
}

// ── Scraping ──────────────────────────────────────────────────────────────────

async function scrapePages(url) {
  const base = url.replace(/\/$/, '').replace(/\/(about|glyphs|tester|analytics)$/, '');
  const pages = {
    specimen: base,
    about:    `${base}/about`,
    glyphs:   `${base}/glyphs`,
  };

  const browser = await chromium.launch({ headless: true });
  const context  = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results  = {};

  for (const [key, pageUrl] of Object.entries(pages)) {
    console.log(`  → ${pageUrl}`);
    const page = await context.newPage();
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 });
      // Google Fonts requires extra time after networkidle for JS hydration
      await page.waitForTimeout(2500);
      results[key] = await page.evaluate(() => document.body.innerText);
    } catch (err) {
      console.warn(`  ⚠  Could not load ${pageUrl}: ${err.message}`);
      results[key] = '';
    }
    await page.close();
  }

  await browser.close();
  return results;
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseScrapedData({ specimen, about, glyphs }, inputUrl) {
  // Font name — derive from URL first (most reliable), then specimen text
  const urlSegment = decodeURIComponent(
    inputUrl.split('/specimen/')[1]?.split('/')[0] || ''
  ).replace(/\+/g, ' ');
  const name = urlSegment || 'TODO_FONT_NAME';
  const slug = slugify(name);

  // Designers — look for "Designed by" or "Designers:" patterns
  let designers = [];
  const designerMatch =
    specimen.match(/[Dd]esigned\s+by\s+([^\n.]+)/) ||
    specimen.match(/[Dd]esigners?:?\s+([^\n.]+)/);
  if (designerMatch) {
    designers = designerMatch[1]
      .split(/,\s*|\s+and\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 60); // filter runaway matches
  }

  // Classification — match Google's top-level tag
  let classification = ['sans-serif'];
  for (const [googleLabel, tsClass] of Object.entries(CLASSIFICATION_MAP)) {
    if (specimen.includes(googleLabel)) {
      classification = tsClass;
      break;
    }
  }

  // Sub-classification — check the About page first (authoritative editorial
  // description), then fall back to the specimen page. This prevents the specimen
  // page mentioning "grotesque" in a historical or comparative context from
  // winning over the About page explicitly calling it "humanist sans serif."
  function matchSubTag(text) {
    for (const sub of KNOWN_SUB_TAGS) {
      if (new RegExp(`\\b${sub}\\b`, 'i').test(text)) {
        const isSans = classification.includes('sans-serif');
        return (isSans && !sub.toLowerCase().includes('sans'))
          ? `${sub} Sans`
          : sub;
      }
    }
    return null;
  }
  let subClassification = matchSubTag(about) ?? matchSubTag(specimen);

  // Variable font — Google states this clearly as "Variable" in Technology field
  const variableFont = /\bVariable\b/.test(specimen);

  // Italics — Google lists italic styles alongside roman styles
  const hasItalics = /italic/i.test(specimen);

  // Weight range
  const weightRange = parseWeightRange(specimen);

  // Moods → personality tags
  // Vintage specifically maps to era, not personality
  const foundMoods = Object.keys(MOOD_TO_PERSONALITY).filter(mood =>
    new RegExp(`\\b${mood}\\b`).test(specimen)
  );
  const eraFromVintage = foundMoods.includes('Vintage') ? ['Vintage'] : [];
  const personalityTagsRaw = unique(foundMoods.flatMap(m => MOOD_TO_PERSONALITY[m]));
  // Limit to 5 most relevant — reviewer can adjust
  const personalityTags = personalityTagsRaw.slice(0, 5);

  // Multilingual support — glyphs page lists language regions when supported
  const multilingualSupport = /\b(Africa|Americas|Asia|Europe|Oceania)\b/i.test(glyphs);

  // Editorial note source — About page, compressed
  // Strip lines shorter than 40 chars and usage stat lines
  const editorialCandidate = about
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 40 && !/\b(API serves|websites|million|downloads)\b/i.test(l))
    .slice(0, 2)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Contrast heuristic — rough inference from classification
  let contrast = ['medium'];
  if (subClassification?.toLowerCase().includes('grotesque') ||
      subClassification?.toLowerCase().includes('geometric')) {
    contrast = ['monolinear'];
  } else if (classification.includes('display') ||
             classification.includes('serif')) {
    contrast = ['high'];
  }

  // Raw keywords — seed with what we know; reviewer adds more
  const rawKeywords = unique([
    ...designers,
    name,
    'Google Fonts',
    'SIL Open Font License',
    'open source',
  ]);

  return {
    name,
    slug,
    typefaceId: `typeface-${slug}`,
    designers,
    classification,
    subClassification,
    variableFont,
    hasItalics,
    weightRange,
    personalityTags,
    foundMoods,
    eraFromVintage,
    multilingualSupport,
    editorialCandidate,
    rawKeywords,
    contrast,
  };
}

// ── Code generation ───────────────────────────────────────────────────────────

function generateIntakeData(d, inputUrl) {
  const foundryBlock = existingFoundryId
    ? `// ── Foundry ───────────────────────────────────────────────────────────────────
const FOUNDRY_ID = '${existingFoundryId}';  // existing foundry`
    : `// ── Foundry ───────────────────────────────────────────────────────────────────
// TODO: Fill in — find foundry details from the Google Fonts specimen page or GitHub
const FOUNDRY = {
  _id:         'foundry-TODO',         // TODO: confirm slug
  _type:       'foundry',
  name:        'TODO',                 // TODO: foundry name
  slug:        { _type: 'slug', current: 'TODO' },
  location:    'TODO',                 // TODO: city, country
  website:     'TODO',                 // TODO: foundry website URL
  foundryType: 'open-source',
  description: 'TODO',                 // TODO: 1-2 sentence description
};`;

  const specimenFoundrySlug = foundrySlugForSpecimen ?? 'TODO-foundry';
  const specimenFile      = `${specimenFoundrySlug}_${d.slug}_specimen.jpg`;
  const specimenHeavyFile = `${specimenFoundrySlug}_${d.slug}_specimen_heavy.jpg`;

  const moodComment = d.foundMoods.length > 0
    ? `// Google Moods: ${d.foundMoods.join(', ')}`
    : `// Google Moods: none detected — review specimen page`;

  const rawKwFormatted = d.rawKeywords
    .map(k => `'${escapeStr(k)}'`)
    .join(', ');

  const editorialPreview = d.editorialCandidate
    ? `// About page source:\n    // "${escapeStr(d.editorialCandidate.slice(0, 140))}${d.editorialCandidate.length > 140 ? '…' : ''}"`
    : `// TODO: find on fonts.google.com/specimen/${d.name.replace(/ /g, '+')}/about`;

  return `/**
 * intake-data.js — AUTO-GENERATED by intake-google-fonts.js
 * Source: ${inputUrl}
 * Generated: ${new Date().toISOString().slice(0, 10)}
 *
 * Fields marked AUTO were determined programmatically — spot-check before pushing.
 * Review all TODO items, then run: npm run push
 */

${foundryBlock}

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ${jsArray(d.weightRange)}, // AUTO — verify against specimen page
  width:               'normal',                  // TODO: adjust if condensed or wide
  era:                 ${jsArray(['Contemporary', ...d.eraFromVintage])}, // TODO: review
  licensing:           'free',        // AUTO — always free on Google Fonts
  platforms:           'google-fonts',// AUTO
  variableFont:        ${d.variableFont},   // AUTO
  multilingualSupport: ${d.multilingualSupport},  // AUTO — confirm on Glyphs tab
  hasItalics:          ${d.hasItalics},     // AUTO
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               '${d.typefaceId}',
    name:              '${escapeStr(d.name)}',
    slug:              '${d.slug}',

    // Specimen capture — find the external URL where the font loads cleanly.
    // Google Fonts uses internal names like "gf_${d.name.replace(/ /g, '_')}_variant0" — not usable.
    // Check the specimen page for a linked foundry website, or look up the GitHub repo at:
    //   github.com/google/fonts/tree/main/ofl/${d.slug.replace(/-/g, '')}
    // Then run:
    //   npm run specimen -- --foundry ${specimenFoundrySlug} --typeface ${d.slug} \\
    //     --font-family "FONT NAME ON THAT PAGE" --text "${escapeStr(d.name)}" --url <external-url>
    specimenFile:      '${specimenFile}',
    specimenHeavyFile: '${specimenHeavyFile}', // remove line if heavy weight is not visually distinct

    // Editorial note — compress to 1-2 sentences, preserve the original voice
    ${editorialPreview}
    editorialNote:     'TODO',

    classification:    ${jsArray(d.classification)}, // AUTO
    subClassification: '${escapeStr(d.subClassification || 'TODO')}', // AUTO — confirm
    ${moodComment}
    personalityTags:   ${jsArray(d.personalityTags)}, // AUTO — review and adjust
    useCaseTags:       ['Branding', 'Digital UI', 'Headline'], // TODO — review
    contrast:          ${jsArray(d.contrast)},   // AUTO — spot-check
    width:             'normal',                 // TODO: adjust if needed

    typefaceURL:       '${inputUrl}', // TODO: replace with foundry page URL if one exists
    rawKeywords:       [${rawKwFormatted}], // TODO: expand with descriptive terms
    hasItalics:        ${d.hasItalics}, // AUTO
  },
];

module.exports = { ${existingFoundryId ? 'FOUNDRY_ID' : 'FOUNDRY'}, SHARED, TYPEFACES };
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nTypeScout — Google Fonts intake`);
  console.log(`Source : ${inputUrl}`);
  if (existingFoundryId) {
    console.log(`Foundry: ${existingFoundryId} (existing)`);
  }
  console.log('');

  console.log('Fetching Google Fonts pages…');
  const pages = await scrapePages(inputUrl);

  const data = parseScrapedData(pages, inputUrl);

  console.log('\n── Detected ──────────────────────────────────────────────────');
  console.log(`  Name            : ${data.name}`);
  console.log(`  Slug            : ${data.slug}`);
  console.log(`  Classification  : ${data.classification.join(', ')}${data.subClassification ? ` — ${data.subClassification}` : ''}`);
  console.log(`  Designers       : ${data.designers.join(', ') || '(none detected)'}`);
  console.log(`  Weight range    : ${data.weightRange.join(', ')}`);
  console.log(`  Variable font   : ${data.variableFont}`);
  console.log(`  Has italics     : ${data.hasItalics}`);
  console.log(`  Multilingual    : ${data.multilingualSupport}`);
  console.log(`  Google Moods    : ${data.foundMoods.join(', ') || '(none detected)'}`);
  console.log(`  personalityTags : ${data.personalityTags.join(', ') || '(none)'}`);
  console.log('──────────────────────────────────────────────────────────────');

  const output = generateIntakeData(data, inputUrl);
  const outPath = path.join(process.cwd(), 'scripts', 'intake-data.js');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log(`\n✓ Wrote scripts/intake-data.js\n`);
  console.log('Next steps:');
  console.log('  1. Review all TODO items in scripts/intake-data.js');
  console.log('  2. Find the external URL where the font loads cleanly (not fonts.google.com)');
  console.log(`     → Check specimen page for linked foundry site, or:`);
  console.log(`     → github.com/google/fonts/tree/main/ofl/${data.slug.replace(/-/g, '')}`);
  console.log(`  3. npm run specimen -- --foundry <slug> --typeface ${data.slug} --font-family "..." --url <url>`);
  console.log('  4. Check heavy variant — keep only if weight 900 looks distinct from regular');
  console.log('  5. Write the editorialNote (compress the About page copy, 1-2 sentences)');
  console.log('  6. npm run push');
  console.log('  7. Verify at localhost:3000\n');
}

main().catch(err => {
  console.error(`\n✗ ${err.message}\n`);
  process.exit(1);
});
