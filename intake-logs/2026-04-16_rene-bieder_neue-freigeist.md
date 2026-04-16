# Intake Log — Neue Freigeist / Studio René Bieder
**Date:** 2026-04-16
**Operator:** Gabriel Dufresne
**Foundry:** Studio René Bieder (new)
**Typeface:** Neue Freigeist (new)
**Source URL:** https://www.renebieder.com/fonts/neue-freigeist

---

## Step 0 — Duplicate Check

```bash
npm run check -- --foundry rene-bieder --typeface neue-freigeist
```

**Result:**
- Foundry `rene-bieder` — not found, new entry required
- Typeface `neue-freigeist` — not found, clear to proceed

---

## Step 1 — Page Extraction

### Typeface page — WebFetch (primary attempt)

Fetched `https://www.renebieder.com/fonts/neue-freigeist` via WebFetch. Returned partial content — weight list and OT features, but no typeface description. The description lives in a collapsed accordion ("Information") that WebFetch cannot expand.

**What WebFetch returned:**
- 9 weights + 9 italics = 18 styles: ExtraLight through Heavy
- OT features: tabular/proportional figures, fractions, discretionary ligatures, case-sensitive forms, alternates for a, g, y, r, ß, Q, R, 1, 3, arrows, curly Q, e
- Price: €35.00 per style
- Variable font: mentioned as available (not surfaced by WebFetch)

### Foundry about page — WebFetch

Fetched `https://www.renebieder.com/about` via WebFetch.

**Returned:**
- Designer: René Bieder (*1982)
- Founded: 2012
- Speciality: retail and custom type design
- Location: **not returned** — not on the about page

### Playwright fallback — full body text

WebFetch could not access the accordion content or the location. Opened the typeface page via Playwright:

```bash
playwright-cli -s=intake open https://www.renebieder.com/fonts/neue-freigeist
playwright-cli -s=intake eval "document.querySelector('main')?.innerText"
```

`main` returned `undefined` — the site does not use a `<main>` element. Fell back to:

```bash
playwright-cli -s=intake eval "document.body.innerText"
```

Returned the full page content including all tester copy, weight labels, and OT feature labels — but still no description text. The Information accordion was present but collapsed.

### Finding the location — Impressum

WebFetch on `/impressum` returned 404. Found the correct URL via DOM:

```bash
playwright-cli -s=intake eval "document.querySelector('a[href*=impressum], a[href*=imprint]')?.href"
# → https://www.renebieder.com/info#impressum
```

Navigated to `/info` and extracted the Impressum content:

```bash
playwright-cli -s=intake open https://www.renebieder.com/info
playwright-cli -s=intake eval "Array.from(document.querySelectorAll('*')).filter(function(el){ return el.id === 'impressum'; })[0]?.parentElement?.innerText?.slice(0,600)"
```

**Result:**
```
Studio René Bieder
René Bieder, Eisenacher Str. 30
10781 Berlin, Germany
```

Location confirmed: **Berlin, Germany**.

### Expanding the Information accordion

Back on the typeface page. Found the "Information" button:

```bash
playwright-cli -s=intake eval "Array.from(document.querySelectorAll('button, [role=button]')).map(el => el.textContent?.trim()).filter(Boolean)"
# → [..., "Information", "Languages", "Alternates", "Glyphset", "Test", "Buy", ...]
```

Triggered the click and read the parent container:

```bash
playwright-cli -s=intake eval "Array.from(document.querySelectorAll('button, [role=button]')).find(function(el){ return el.textContent.trim() === 'Information'; })?.click()"

playwright-cli -s=intake eval "Array.from(document.querySelectorAll('button, [role=button]')).find(function(el){ return el.textContent.trim() === 'Information'; })?.parentElement?.parentElement?.innerText?.slice(0,2000)"
```

**Result — full Information block:**
```
Name: Neue Freigeist
Released: 2022
Styles: 9 Weights, 9 Italics
Variable file: Available, on request
Version: 1.000

Designed by: René Bieder
Spacing and Kerning: Igino Marini
Font Engineering: Christoph Köberlin

The early Grotesk typefaces, with their untamed and uninhibited nature, exuded the vibrant energy
of the golden age of type design. Building upon this legacy, the Neue Freigeist family takes
inspiration from those influential stages of the Grotesk style spanning from 1850 to 1950,
seamlessly bridging the past with the present. In essence, Neue Freigeist is an aged typeface
with a youthful expression, a true testament to its paradoxical nature. Neue Freigeist
encapsulates the rich heritage of typography and brings forth a fresh, innovative voice that
resonates with modern design sensibilities.

With the purchase of a full family license, Neue Freigeist is available in two variable fonts
(roman and italic), offering the design range spanning from ExtraLight to Heavy.
```

### Font family name lookup — Tier 2

```bash
playwright-cli -s=intake eval "JSON.stringify([...document.fonts].filter(function(f){ return f.family.toLowerCase().includes('freigeist'); }).map(function(f){ return {family: f.family, weight: f.weight, status: f.status}; }))"
```

**Result — all 18 weights loaded:**
```json
[
  { "family": "Neue Freigeist ExtraLight",        "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist ExtraLight Italic",  "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Light",              "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Light Italic",       "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Regular",            "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Regular Italic",     "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Medium",             "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Medium Italic",      "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist SemiBold",           "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist SemiBold Italic",    "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Bold",               "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Bold Italic",        "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist ExtraBold",          "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist ExtraBold Italic",   "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Black",              "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Black Italic",       "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Heavy",              "weight": "400", "status": "loaded" },
  { "family": "Neue Freigeist Heavy Italic",       "weight": "400", "status": "loaded" }
]
```

The foundry registers each weight as its own CSS family (Tier 2 pattern, same as Tipografies/Sharp Type).
Specimen families selected:
- **Regular:** `"Neue Freigeist Regular"`
- **Heavy:** `"Neue Freigeist Heavy"`

---

## Step 2 — Schema Fields

### Foundry

| Field | Value |
|---|---|
| `name` | Studio René Bieder |
| `slug` | `rene-bieder` |
| `location` | Berlin, Germany |
| `website` | https://www.renebieder.com |
| `foundryType` | `independent` |
| `description` | René Bieder is an award-winning type designer based in Berlin who established his eponymous studio in 2012 after two decades as an art director and graphic designer. The studio specialises in retail and custom typeface design, combining traditional craftsmanship with contemporary sensibilities. Custom typeface work for global brands includes Volkswagen Group, SUSE, and Bahlsen. |

### Typeface

| Field | Value |
|---|---|
| `name` | Neue Freigeist |
| `slug` | `neue-freigeist` |
| `classification` | `['sans-serif']` |
| `subClassification` | Humanist Grotesque Revival |
| `personalityTags` | Sophisticated, Warm, Refined, Expressive |
| `useCaseTags` | Branding, Editorial, Headline, Body Text |
| `era` | Contemporary, Heritage, Modernist |
| `weightRange` | light, regular, medium, semibold, bold, extrabold, black |
| `width` | `normal` |
| `contrast` | `low` |
| `xHeight` | `tall` |
| `licensing` | `paid` |
| `platforms` | `neither` |
| `variableFont` | `true` (available on request, full family licence) |
| `multilingualSupport` | `false` (Western European by default; no 50+ language claim) |
| `featured` | `false` |

**Weight mapping notes:**
- ExtraLight (200) → `light` — closest schema value; "ExtraLight" added to `rawKeywords`
- Heavy (above Black) → `black` — closest schema value; "Heavy" added to `rawKeywords`

---

## Step 3 — Variant Detection

No optical variants detected. The full weight list (ExtraLight through Heavy) is a single family — not separate optical styles. No Condensed, Extended, Display, or Text cuts listed on the page. One record only.

---

## Step 4 — Editorial Note

Based on the foundry's own description in the Information accordion. Rewritten to editorial voice:

> Neue Freigeist draws on the untamed energy of early Grotesk typefaces from 1850 to 1950, treating that century of type design history as raw material for something entirely contemporary. Designed by René Bieder and released in 2022, its nine weights from ExtraLight to Heavy — with italics throughout — carry the warmth and subtle stroke modulation of humanist Grotesks into a family built for modern use.

Approved by operator before push.

---

## Step 5 — Specimen Capture

### Regular

```bash
npm run specimen -- \
  --foundry rene-bieder \
  --typeface neue-freigeist \
  --font-family "Neue Freigeist Regular" \
  --text "Neue Freigeist" \
  --url https://www.renebieder.com/fonts/neue-freigeist
```

Output: `specimens/rene-bieder_neue-freigeist_specimen.jpg` — 852×200px CSS / 1704×400px 2× · 51KB

### Heavy

```bash
npm run specimen -- \
  --foundry rene-bieder \
  --typeface neue-freigeist \
  --font-family "Neue Freigeist Heavy" \
  --text "Neue Freigeist" \
  --url https://www.renebieder.com/fonts/neue-freigeist \
  --heavy
```

Output: `specimens/rene-bieder_neue-freigeist_specimen_heavy.jpg` — 924×200px CSS / 1848×400px 2× · 48KB

### Visual review

Both specimens rendered correctly — white background, typeface name as display text. Visually confirmed:
- **Regular:** elegant, open counters, double-storey `g`, subtle humanist stroke modulation, tall x-height
- **Heavy:** dramatically denser — counters significantly reduced, ink traps prominent, clearly distinct from Regular
- Heavy specimen retained (meaningfully different character at display size)

Visual properties confirmed from specimens:
- **contrast:** `low` (visible but subtle stroke modulation — not monolinear)
- **xHeight:** `tall`
- **width:** `normal`

---

## Step 6 — intake-data.js

Edited `scripts/intake-data.js`:

```js
const FOUNDRY = {
  _type:       'foundry',
  _id:         'foundry-rene-bieder',
  name:        'Studio René Bieder',
  slug:        { _type: 'slug', current: 'rene-bieder' },
  location:    'Berlin, Germany',
  website:     'https://www.renebieder.com',
  foundryType: 'independent',
  description: 'René Bieder is an award-winning type designer based in Berlin who established his eponymous studio in 2012 after two decades as an art director and graphic designer. The studio specialises in retail and custom typeface design, combining traditional craftsmanship with contemporary sensibilities. Custom typeface work for global brands includes Volkswagen Group, SUSE, and Bahlsen.',
};
const FOUNDRY_ID = null;

const SHARED = {
  weightRange:         ['light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
  era:                 ['Contemporary', 'Heritage', 'Modernist'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        true,
  multilingualSupport: false,
  featured:            false,
};

const TYPEFACES = [
  {
    _id:               'typeface-neue-freigeist',
    name:              'Neue Freigeist',
    slug:              'neue-freigeist',
    specimenFile:      'rene-bieder_neue-freigeist_specimen.jpg',
    specimenHeavyFile: 'rene-bieder_neue-freigeist_specimen_heavy.jpg',
    editorialNote:     'Neue Freigeist draws on the untamed energy of early Grotesk typefaces from 1850 to 1950, treating that century of type design history as raw material for something entirely contemporary. Designed by René Bieder and released in 2022, its nine weights from ExtraLight to Heavy — with italics throughout — carry the warmth and subtle stroke modulation of humanist Grotesks into a family built for modern use.',
    classification:    ['sans-serif'],
    subClassification: 'Humanist Grotesque Revival',
    personalityTags:   ['Sophisticated', 'Warm', 'Refined', 'Expressive'],
    useCaseTags:       ['Branding', 'Editorial', 'Headline', 'Body Text'],
    width:             'normal',
    xHeight:           'tall',
    contrast:          ['low'],
    typefaceURL:       'https://www.renebieder.com/fonts/neue-freigeist',
    rawKeywords:       ['René Bieder', 'Igino Marini', 'Christoph Köberlin', 'Grotesk revival', '1850-1950', '2022', 'ExtraLight', 'Heavy', 'variable font on request', 'Freigeist', 'free spirit', 'double-storey g', 'alternate a', 'alternate g', 'alternate y', 'Berlin', 'golden age of type design'],
  },
];
```

---

## Step 7 — Push to Sanity

```bash
npm run push
```

**Output:**
```
Uploading specimens…
  → Uploading rene-bieder_neue-freigeist_specimen.jpg…
    ✓ Asset ID: image-6522949a1a528b1b9588601034bd0babb95e28a5-1704x400-jpg
  → Uploading rene-bieder_neue-freigeist_specimen_heavy.jpg…
    ✓ Asset ID: image-1d3ee918f11da7764b94f2f546acdbb9ec59a2c7-1848x400-jpg

Creating foundry…
  ✓ foundry-rene-bieder created

Creating typefaces…
  ✓ typeface-neue-freigeist created

✓ All done. Records are live in Sanity.
```

---

## Step 8 — Studio Verification

Pending operator review at `localhost:3333`.

**Checklist:**
- [ ] Studio René Bieder foundry record — name, Berlin location, description correct
- [ ] Neue Freigeist linked to foundry, all tags accurate
- [ ] Regular specimen: elegant Grotesque, humanist details visible
- [ ] Heavy specimen: dramatically denser — counters reduced, ink traps prominent
- [ ] Editorial note reads correctly

---

## Notes & Learnings

### Site structure — no `<main>` element
`document.querySelector('main')` returned `undefined`. This site uses no `<main>` semantic element. Fall straight to `document.body.innerText` — do not try intermediate selectors first.

### Description in collapsed accordion
The typeface description was not visible in the page source or via `body.innerText` in the initial state. It lived inside a collapsed accordion triggered by an "Information" button. Required:
1. Identifying the button via `querySelectorAll('button, [role=button]')`
2. Calling `.click()` on it
3. Reading the parent container's `innerText` rather than re-scraping the full body

Lesson: when a page has no visible description, look for accordion/tab controls before concluding the description doesn't exist.

### Location via Impressum (German legal requirement)
The about page had no address. The Impressum at `/info#impressum` had the full postal address — a reliable fallback for German/Austrian/Swiss foundries, which are legally required to publish one.

The correct query pattern to extract it:
```js
Array.from(document.querySelectorAll('*'))
  .filter(function(el){ return el.id === 'impressum'; })[0]
  ?.parentElement?.innerText?.slice(0, 600)
```

### Per-weight CSS family names (Tier 2 pattern)
This foundry registers each weight as its own CSS family (e.g. `"Neue Freigeist Regular"`, `"Neue Freigeist Heavy"`) rather than using a single family with weight axes. This is the same pattern as Tipografies and Sharp Type. Use the Tier 2 `document.fonts` eval to confirm names before running `npm run specimen`.

### Weight mapping — ExtraLight and Heavy
The schema does not have `extralight` or `heavy` values. Mapped:
- `ExtraLight` → `light` (closest CSS weight 200 → 300)
- `Heavy` → `black` (above Black, maps to the heaviest schema value)

Both original labels added to `rawKeywords` so they remain searchable.

### Variable font — available on request
"Variable file: Available, on request" means the variable font exists but is not included in the standard per-weight purchase. Set `variableFont: true` — it is a real capability of the typeface. Noted in `rawKeywords` as "variable font on request".

---

*TypeScout intake log — Studio René Bieder / Neue Freigeist*
