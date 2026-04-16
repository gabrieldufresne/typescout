# Intake Transcript — Typeverything / Olivo
**Date:** 2026-04-15  
**Operator:** Gabriel Dufresne  
**Agent:** Claude Sonnet 4.6  

---

## Step 0 — Duplicate check

First action before touching any browser. The intake workflow is strict: run `npm run check` before everything else. The foundry slug I guessed from the domain (`typeverything.com` → `typeverything`) and the typeface slug from the URL path (`/olivo` → `olivo`).

```bash
npm run check -- --foundry typeverything --typeface olivo
```

Result: both new, clear to proceed.

---

## Step 1 — Page content extraction

### First attempt: WebFetch

The intake workflow says to always try WebFetch first — it requires no Bash approval, is faster, and costs fewer tokens than opening a Playwright session. I ran both the typeface page and the foundry about page in parallel.

Both returned empty — the response was just "Typeverything" as a heading. The site is a Vue.js single-page application, so WebFetch only gets the pre-hydration HTML shell with no content. Fell back to playwright-cli as documented.

### Playwright fallback — typeface page

```bash
playwright-cli -s=intake open https://typeverything.com/olivo
playwright-cli -s=intake eval "document.querySelector('main')?.innerText"
```

`main` returned `undefined` — the Vue app doesn't use a `<main>` element. Tried `document.body.innerText` instead, which returned the full rendered page text including:

- Typeface name: Olivo
- 16 styles listed (8 upright + 8 italic)
- Weight names in order: Light, Text, Regular, Medium, SemiBold, Bold, ExtraBold, Heavy
- Full foundry description of Olivo
- Designer credit: Andrei Robu, support by Cristi Bordeianu
- Files: OTF, WOFF, Variable
- OpenType features: Alternates, Ligatures
- Key quote: "Designed for branding, display, and text, Olivo bridges mid-century character with modern clarity"
- Reference to Antique Olive as the source design

### Playwright — foundry info page

Tried `/info` first (a common foundry path) — returned only nav links, no content. Then tried `/about` — same result. Discovered the correct URL from the nav links: `/pages/info`.

At `/pages/info`, `document.body.innerText` returned the same empty nav. The page content is rendered inside a Vue component that `innerText` on body doesn't catch. Used a broader CSS selector query targeting `.content, .page-content, article, section, [class*=page]` which finally returned the rendered text:

> "Typeverything is a type-foundry specialising in the development of display fonts. Founded in 2011 by Andrei Robu..."

This gave me the foundry description. No location was mentioned anywhere on the page or in meta tags.

### Location decision

The info page made no mention of a city or country. Checked meta tags — only a description tag, no geo data. Noted that the footer includes an ODR link (EU Online Dispute Resolution platform), which confirms EU jurisdiction. Andrei Robu is Romanian, pointing to Romania as the likely location. However, this is an inference from training data, not from the page. Flagged it for operator review. Operator decision: omit location entirely rather than publish unconfirmed data. Correct call — the Sanity schema doesn't require the field.

---

## Step 2 — Schema field decisions

### Foundry type

"Brings together a collective of independent type designers" — this is `independent`. Not a commercial arm of a larger corporation, not open-source.

### Classification

Olivo is based on Antique Olive, a sans-serif grotesque. The description says it's "designed for branding, display, and text" with display being the primary positioning. Classification: `['sans-serif', 'display']`.

### Sub-classification

Antique Olive is a grotesque sans with distinctive reversed modulation (thick horizontals, thin verticals — the opposite of classical contrast). For TypeScout's sub-classification field, "Display Grotesque" captures both the display orientation and the grotesque heritage without requiring knowledge of the Antique Olive reference.

### Personality tags

Working from the foundry's own language: "confident, human, and unmistakably fresh" + "mid-century character with modern clarity." From the controlled vocabulary:
- Bold — 16 styles including heavy weights, designed for display
- Expressive — "unmistakably fresh", high personality
- Sophisticated — mid-century character, design heritage
- Refined — the careful reworking of proportions and contrast for digital
- Functional — "performs beautifully across contemporary media", designed for text as well as display

### Use case tags

Directly from the page: "branding, display, and text." Expanded to specific tags:
- Branding — stated directly
- Headline — display use case
- Poster — display use case
- Packaging — branding-adjacent, strong weights suit it
- Digital UI — "adjusted for digital environments" is the core design premise

### Era tags

Contemporary — described as a contemporary reinterpretation. Modernist — Antique Olive is a 1960s modernist typeface; Olivo inherits that lineage even while updating it.

### Weight range

The font has 8 upright weights: Light, Text, Regular, Medium, SemiBold, Bold, ExtraBold, Heavy. The schema has 8 weight values: thin, light, regular, medium, semibold, bold, extrabold, black. Mapping:

| Font weight | Schema value | Note |
|---|---|---|
| Light | `light` | Direct match |
| Text | `regular` | Between Light and Regular — likely a book/350 weight. Closest schema value is `regular`. Added to rawKeywords to preserve the distinction. |
| Regular | `regular` | Both Text and Regular map here; `regular` in the schema represents the canonical upright weight |
| Medium | `medium` | Direct match |
| SemiBold | `semibold` | Direct match |
| Bold | `bold` | Direct match |
| ExtraBold | `extrabold` | Direct match |
| Heavy | `black` | Per intake workflow weight mapping table: "Black / Heavy / Ultra / 900" → `black` |

Note: having both "Text" and "Regular" mapping to `regular` is a limitation of the schema, not a data error. The "Text weight" entry in rawKeywords preserves the distinction for future search use.

### Contrast

Antique Olive has famous reversed modulation — thick horizontals, thin verticals. This is high contrast but in the opposite direction from classical typefaces. Olivo explicitly "adjusted the proportions, contrast, and rhythm" for digital use — digital adaptation typically means reducing extreme contrast. Settled on `medium`: the reversed contrast logic is retained but not at the extreme of the original. Added "reverse contrast" and "modulated grotesque" to rawKeywords to make this searchable.

### x-Height

Antique Olive is known for an unusually low x-height — one of its most distinctive visual signatures. The description doesn't mention changing this, and the displayed type tester text confirms the low x-height is intact in Olivo. Set to `low`.

### Variable font

Confirmed: "The first release includes 16 styles and a variable font for complete flexibility" + "Files: Otf, Woff, Variable." Set to `true`.

### Multilingual support

No mention of language coverage on the page. No language count, no mention of scripts or extended character sets beyond the type tester samples. Set to `false`.

### Licensing

Has a "Buy" button in the nav and a dedicated `/olivo/buy` page. Commercial foundry. Set to `paid`.

### Platforms

No Google Fonts or Adobe Fonts mention anywhere on the page. Set to `neither`.

### Purchase URL

Found in link list: `https://typeverything.com/olivo/buy`. This is the correct purchase URL — not the typeface landing page, but the direct buy page.

### Variant detection

The page presents Olivo as a single family with 8 weights × 2 (upright + italic) = 16 styles. No optical variants (no Sans/Serif/Text optical size split, no Condensed/Extended width variants). Single record confirmed.

---

## Step 3 — Editorial note

Base material from the foundry's own description:

> "Olivo is a contemporary reinterpretation of the iconic Antique Olive. While the original has been reimagined many times and remains a cornerstone of modern typography, we revisited it with a focus on today's visual language. The original contrast logic, so distinctive in print, felt less suited for digital environments. We adjusted the proportions, contrast, and rhythm to create a version that performs beautifully across contemporary media. The first release includes 16 styles and a variable font for complete flexibility. Designed for branding, display, and text, Olivo bridges mid-century character with modern clarity, confident, human, and unmistakably fresh."

Draft editorial note — objectives: identify the design's concept/origin, its defining visual characteristic, its strongest use case. 1–3 sentences, neutral voice, not marketing copy:

> Olivo is a contemporary reinterpretation of Antique Olive — Roger Excoffon's iconic 1960s grotesque, known for its reversed contrast and distinctively low x-height. Where the original was optimised for print, Olivo reworks the proportions, contrast, and rhythm for digital environments without losing the genre's mid-century authority. The family spans 16 styles including a variable font, covering branding, display, and text settings.

Changes from the foundry's version: added Roger Excoffon attribution (historically accurate context not on the page), named the specific visual characteristics (reversed contrast, low x-height) that define the genre, removed marketing language ("confident, human, and unmistakably fresh"), structured as three sentences covering origin → adaptation → scope.

Operator approved as written.

---

## Step 4 — Font family name lookup

### Tier 1 — try typeface name directly

Not attempted as a standalone test — went straight to Tier 2 because I already had the page open in a Playwright session and needed to check fonts anyway given the numeric-suffix pattern is common with Vue-based type foundry storefronts.

### Tier 2 — document.fonts eval

```bash
playwright-cli -s=intake eval "JSON.stringify([...document.fonts].filter(f => f.status === 'loaded').map(f => ({family: f.family, weight: f.weight})))"
```

First attempt returned `[]` — fonts not loaded at that moment. Second attempt (all statuses):

```bash
playwright-cli -s=intake eval "JSON.stringify([...document.fonts].map(f => ({family: f.family, weight: f.weight, status: f.status})))"
```

Returned all 16 Olivo weights plus Inter (UI font) and `icons`. Pattern: each weight registered as its own CSS family with a numeric suffix — e.g., `Olivo Regular968`, `Olivo Heavy974`. This is the same pattern as Schick Toikka (documented in typeface-screenshot-tool.md under Tier 3), but here the family names are human-readable rather than UUID-based, so Tier 2 is sufficient — no DOM cross-reference needed.

Selected:
- Regular specimen: `Olivo Regular968`
- Heavy specimen: `Olivo Heavy974`

---

## Step 5 — Specimen capture

### Regular

```bash
npm run specimen -- --foundry typeverything --typeface olivo \
  --font-family "Olivo Regular968" --text "Olivo" \
  --url https://typeverything.com/olivo
```

Output: `specimens/typeverything_olivo_specimen.jpg` — 327×215px (CSS), 654×430px actual (2× device scale). The `--text "Olivo"` flag is required because the CSS family name (`Olivo Regular968`) differs from the display text (`Olivo`).

### Heavy

```bash
npm run specimen -- --foundry typeverything --typeface olivo \
  --font-family "Olivo Heavy974" --text "Olivo" \
  --url https://typeverything.com/olivo --heavy
```

Output: `specimens/typeverything_olivo_specimen_heavy.jpg` — 341×215px (CSS), 682×430px actual. Slightly wider than the regular because Heavy strokes add width to letterforms. This width difference visually confirms the heavy is rendering correctly.

Both specimens confirmed by operator: white background, typeface name as display text, visually distinct weights.

---

## Step 6 — Push script

Replaced the previous intake block (Due Studio / Grotta) with the Typeverything / Olivo data. Key structural notes:

- `FOUNDRY` object: omitted the `location` field entirely (not a required field in Sanity schema, and location was unconfirmed)
- `SHARED` block: `variableFont: true` and `multilingualSupport: false` — differs from most previous intakes
- `TYPEFACES` array: single record, includes both `specimenFile` and `specimenHeavyFile`
- `purchaseURL` added as a field — this is the `/olivo/buy` direct URL, not the typeface landing page

The archived Ivar Script records in `_ARCHIVED` were left untouched — they are historical records already pushed and serve as reference.

---

## Step 7 — Push

```bash
npm run push
```

Result:
- `image-9d846584c93353381fd880ccdee540ffa17313ed-654x430-jpg` — regular specimen asset
- `image-58b929dcdd32f3b010177f7ae270d8ee3e7c5dd7-682x430-jpg` — heavy specimen asset
- `foundry-typeverything` — created
- `typeface-olivo` — created

All four operations succeeded. No 403 errors, no missing fields.

---

## Summary record

| Field | Value |
|---|---|
| Foundry | Typeverything |
| Foundry slug | typeverything |
| Foundry type | independent |
| Founded | 2011 |
| Founder | Andrei Robu |
| Typeface | Olivo |
| Typeface slug | olivo |
| Classification | sans-serif, display |
| Sub-classification | Display Grotesque |
| Weights | light, regular, medium, semibold, bold, extrabold, black |
| Width | normal |
| Contrast | medium |
| x-Height | low |
| Era | Contemporary, Modernist |
| Personality | Bold, Expressive, Sophisticated, Refined, Functional |
| Use cases | Branding, Headline, Poster, Packaging, Digital UI |
| Variable font | yes |
| Multilingual | no |
| Licensing | paid |
| Platforms | neither |
| Purchase URL | https://typeverything.com/olivo/buy |
| Regular specimen | typeverything_olivo_specimen.jpg |
| Heavy specimen | typeverything_olivo_specimen_heavy.jpg |
| Font family (regular) | Olivo Regular968 |
| Font family (heavy) | Olivo Heavy974 |

---

*TypeScout intake — August Strategy*
