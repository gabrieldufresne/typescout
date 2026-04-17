# TypeScout Intake Workflow

Complete process for adding a foundry and typeface to TypeScout — from a URL to verified records in Sanity. Follow every step in order.

**Token discipline:** Try WebFetch before opening any browser. Use `main.innerText` only as a fallback for JS-rendered pages. Skip about-page visits for repeat foundries. Never investigate pricing.

---

## Step 0 — Duplicate check (always first)

Before opening any browser, confirm neither record exists.

```bash
npm run check -- --foundry <slug> --typeface <slug>
```

**If the foundry already exists:** skip all foundry intake. Use the existing `_id` as the reference. The check output tells you the `_id`.

**If the typeface already exists:** stop and confirm with the operator before proceeding.

---

## Step 1 — Extract page content

**Always try WebFetch first** — no Bash approval required, works for server-rendered pages:

> Fetch `<typeface URL>` and extract: typeface name, designer, year, weight names, description, pricing/licensing, variable font support, multilingual support, variants, CSS font-family name if visible.

> Fetch the foundry's about page and extract: foundry name, location, founding year, description. Common paths to try in order: `/about` · `/info` · `/pages/info` · `/pages/about` · `/studio` · `/foundry` · `/information`. Try each until one returns useful content — most foundries use one of these.

**If WebFetch returns empty, "LOADING", or clearly incomplete content** — the page is JS-rendered. Fall back to playwright-cli:

```bash
playwright-cli -s=intake open <url>
playwright-cli -s=intake eval "document.querySelector('main')?.innerText"
```

**If `main?.innerText` returns `undefined`** — the site is a Vue/React SPA that doesn't use a `<main>` element. Try `document.body.innerText` first. If that also misses content (because it lives inside a component), use a broader CSS selector:

```bash
playwright-cli -s=intake eval "document.querySelector('.content, .page-content, article, section, [class*=page]')?.innerText"
```

**Font family name** — work through the three lookup tiers in `typeface-screenshot-tool.md` in order. Stop as soon as you have a name that renders correctly:

1. **Tier 1** — try the typeface name directly (`"Chap"`, `"GT America"`). Covers most foundries.
2. **Tier 2** — `document.fonts` eval. Covers foundries with per-weight family names (Tipografies, Sharp Type).
3. **Tier 3** — network interception + DOM cross-reference. For foundries that serve fonts under lazy-loaded UUID names (Schick Toikka pattern).

Never attempt to click "Edit sample" or other UI triggers — fonts load on page init even when obfuscated; the network and DOM are sufficient.

**For variant typefaces:** if the page lists styles (Sans / Serif / Mono etc.), fetch each variant page separately and repeat Step 1 for each.

---

## Step 2 — Fill out schema fields

Work through every field. Present as a compact list, not a table.

### Foundry fields (skip if foundry already exists)

- `name` — exact foundry name
- `slug` — lowercase, hyphens, e.g. `grilli-type`
- `location` — City, Country
- `website` — root domain
- `foundryType` — `independent` | `commercial` | `open-source`
- `description` — 2–4 sentences from About page, neutral editorial voice

### Typeface fields

- `name` — exact typeface name (include variant suffix if splitting)
- `slug` — lowercase, hyphens
- `editorialNote` — 1–3 sentences, see §Editorial Note below, **always human-reviewed**
- `typefaceURL` — the typeface landing page URL (the URL used to trigger intake)
- `classification` — select all that apply from: `serif` `sans-serif` `display` `script` `monospace` `slab-serif` `blackletter` `decorative`
- `subClassification` — free text, 3 words max: `Humanist Grotesque`, `Transitional Serif`, `Geometric Sans`
- `personalityTags` — 3–5 from controlled vocabulary. **"Bold" is a weight descriptor, not a personality tag** — use `Loud`, `Expressive`, or `Authoritative` instead.
- `useCaseTags` — 3–5 from controlled vocabulary
- `era` — 1–3 from controlled vocabulary
- `weightRange` — map from page labels (see §Weight mapping below)
- `width` — `condensed` | `narrow` | `normal` | `wide` | `extended`
- `contrast` — `monolinear` | `low` | `medium` | `high`
- `xHeight` — `low` | `medium` | `tall`
- `licensing` — `free` | `paid` (free = free/open-source/Google Fonts; paid = purchase or subscription required)
- `platforms` — `google-fonts` | `adobe-fonts` | `both` | `neither`
- `variableFont` — `true` if the page lists a variable font or VAR file. This is the only signal used for variable font search — do not add `variable` to `classification`
- `hasItalics` — `true` if the typeface includes italic or oblique styles. Look for: an "Italic" tab or section on the specimen page, italic weights listed in the weight table, `/i` or `Italic` suffixes in font file names visible in the network inspector, or any explicit mention of oblique/slanted styles. Default `false` if not mentioned.
- `multilingualSupport` — `true` if the page mentions multilingual coverage or lists 50+ languages
- `featured` — always `false` on intake
- `rawKeywords` — **always start with the foundry's exact display name** (e.g. `'PangramPangram'`, `'Pangram Pangram'`, `'Grilli Type'`). Add alternate spellings or abbreviations if the name is commonly written multiple ways. Then add other descriptors that don't fit the controlled vocabulary: designer names, year, historical references, technical details

### Weight mapping

| Page label | Schema value |
|---|---|
| Thin / Hairline / 100 | `thin` |
| Light / 300 | `light` |
| Regular / Roman / Book / 400 | `regular` |
| Medium / 500 | `medium` |
| SemiBold / Demi / 600 | `semibold` |
| Bold / 700 | `bold` |
| ExtraBold / 800 | `extrabold` |
| Black / Heavy / Ultra / 900 | `black` |

Weight names outside this vocabulary (e.g. "Heavy" used as a name above Black, "Hairline" as a distinct step below Thin) map to the closest schema value. Add the original label to `rawKeywords` so the distinction is preserved for search.

---

## Step 3 — Detect variants

**Variants are separate records. Weights are not.**

| Type | Separate record? | Examples |
|---|---|---|
| Optical style | **Yes** | Sans / Serif / Flare / Mono / Slab / Display / Text / Condensed / Rounded / Stencil |
| Weight | No | Light / Regular / Bold / Black |
| Italic / Oblique | No | — |

---

## Step 4 — Editorial note

**Always written or reviewed by a human before pushing.**

Before drafting, assess the source material and state which tier applies:

**Rich** — foundry has 2+ sentences of their own copy about the typeface.
→ Compress to 1–3 sentences. Preserve their exact language and voice. Do not rewrite, editorialize, or substitute neutral tone for their own. Only cut for length.

**Thin** — foundry has one sentence, or the description is mostly specs and weight names.
→ Keep what they have. Supplement with context drawn from the page: classification, visual characteristics, historical references, designer name, year.

**Missing** — no description at all.
→ Write from scratch based on what the page reveals: structure, contrast, category, era, use case signals.

**Good:**
> Scatch asks a precise question — what would a Scotch Roman look like if you removed the serifs? Designed in 2023 by Jordi Embodas and David Montserrat, it is a modulated grotesque that retains the rhythm and contrast of the historical Scotch genre while operating entirely as a sans.

**Too vague:**
> A beautiful sans-serif with many weights and multilingual support.

---

## Step 5 — Capture specimens

**The capture script's overlay injection is the only permitted method.** Never screenshot the foundry's own UI — not the type tester, not a hero slide, not a slider frame. The overlay guarantees a white background and the typeface name as display text. A specimen with a dark background or arbitrary sample text (e.g. "Ggr") will look broken in the TypeScout UI and must be recaptured.

The `--text` flag must always be the typeface name — not sample strings, not alphabet pangrams. If omitted, it defaults to `--font-family`, which is only correct when the CSS family name matches the typeface name exactly.

**Regular** — always required:
```bash
npm run specimen -- \
  --foundry <foundry-slug> \
  --typeface <typeface-slug> \
  --font-family "<CSS Regular family name>" \
  --text "<Typeface Name>" \
  --url <foundry page URL>
```

**Heavy** — only if Black/ExtraBold is meaningfully different at display size:
```bash
npm run specimen -- \
  --foundry <foundry-slug> \
  --typeface <typeface-slug> \
  --font-family "<CSS Black/ExtraBold family name>" \
  --text "<Typeface Name>" \
  --url <foundry page URL> \
  --heavy
```

All specimens render at 2× resolution automatically. For variant typefaces, capture regular + heavy for each variant separately.

---

## Step 6 — Update intake-data.js

Edit `scripts/intake-data.js` — this is the **only** file you touch for each intake. Do not edit `scripts/push-to-sanity.js`. Two sections:

**Foundry block** — two cases:

*New foundry:*
```js
const FOUNDRY = {
  _type:       'foundry',
  _id:         'foundry-<slug>',
  name:        '...',
  slug:        { _type: 'slug', current: '<slug>' },
  location:    '...',
  website:     '...',
  foundryType: 'independent' | 'commercial' | 'open-source',
  description: '...',
};
```

*Existing foundry* (check output gives you the `_id`):
```js
const FOUNDRY_ID = 'foundry-<slug>';  // replaces the FOUNDRY object entirely
```

**SHARED block** — fields common to all typefaces in this intake:
```js
const SHARED = {
  weightRange:         [...],
  width:               'normal',
  era:                 [...],
  licensing:           'free' | 'paid',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: true,
  featured:            false,
};
```

**TYPEFACES array** — one object per record:
```js
const TYPEFACES = [
  {
    _id:               'typeface-<slug>',
    name:              '...',
    slug:              '<slug>',
    specimenFile:      '<foundry>_<typeface>_specimen.jpg',
    specimenHeavyFile: '<foundry>_<typeface>_specimen_heavy.jpg',  // omit if no heavy
    editorialNote:     '...',
    classification:    ['sans-serif'],
    subClassification: '...',
    personalityTags:   [...],
    useCaseTags:       [...],
    xHeight:           'tall',
    contrast:          ['low'],
    typefaceURL:       '...',  // the intake URL — no extra lookup needed
    rawKeywords:       [...],
    hasItalics:        false,
  },
];
```

---

## Step 7 — Push to Sanity

```bash
npm run push
```

---

## Step 8 — Verify in Studio

Open `localhost:3333` and confirm:

- [ ] Foundry record appears with correct fields (or existing foundry links correctly)
- [ ] All typeface records appear, linked to the correct foundry
- [ ] Specimen images render correctly — **white background, typeface name as display text**
- [ ] Heavy specimen (if present) is visually distinct from the regular — if not, delete it
- [ ] Editorial note reads correctly
- [ ] Tags look accurate

Then reload `localhost:3000` and run a search that should surface the new typeface.

---

## Tag taxonomy reference

> **Source of truth: `lib/taxonomy.ts`** — edit that file to add or rename tags. The Studio dropdowns and Claude search engine both derive from it automatically. Keep this section in sync when taxonomy changes.

### Classification
`serif` · `sans-serif` · `display` · `script` · `monospace` · `slab-serif` · `blackletter` · `decorative`

### Personality
`Neutral` · `Expressive` · `Elegant` · `Rugged` · `Friendly` · `Serious` · `Playful` · `Sophisticated` · `Warm` · `Cold` · `Minimal` · `Loud` · `Refined` · `Raw` · `Quirky` · `Authoritative` · `Approachable` · `Luxurious` · `Functional` · `Experimental`

### Use Case
`Branding` · `Packaging` · `Editorial` · `Poster` · `Headline` · `Body Text` · `Digital UI` · `Logo` · `Signage` · `Motion` · `Wayfinding` · `Longform Reading` · `Short Copy` · `Captions`

### Era / Reference
`Contemporary` · `Modernist` · `Swiss` · `Bauhaus` · `Art Deco` · `Art Nouveau` · `Victorian` · `Retro` · `Vintage` · `90s` · `Y2K` · `Futuristic` · `Heritage` · `Vernacular` · `Constructivist`

### Weight Range
`thin` · `light` · `regular` · `medium` · `semibold` · `bold` · `extrabold` · `black`

### Contrast
`monolinear` · `low` · `medium` · `high`

### x-Height
`low` · `medium` · `tall`

### Width
`condensed` · `narrow` · `normal` · `wide` · `extended`

### Licensing
`free` — free, open-source, or Google Fonts  
`paid` — purchase required, or Adobe Fonts subscription

### Platforms
`google-fonts` · `adobe-fonts` · `both` · `neither`

---

## rawKeywords — the parking lot

**The foundry name is always the first entry.** Include the exact display name as it appears on the site, plus any common alternate form (e.g. `'PangramPangram'` and `'Pangram Pangram'`; `'Grilli Type'` and `'GT'`). This is what powers foundry-name search — without it, searching the foundry name returns wrong results.

Add any other descriptor from the page that doesn't fit the taxonomy above:
- Designer names, year of release
- Specific historical references
- Technical details (ink traps, optical sizes, double-storey g)
- Unusual use cases or moods

Claude uses `rawKeywords` for query matching even though they don't appear in the UI.

---

*See also: `typeface-screenshot-tool.md` · PRD §07 (schema) · PRD §08 (tag taxonomy) · PRD §09 (specimen spec)*
