# Intake Log — Public Sans / USWDS
**Date:** 2026-04-19  
**Operator:** Gabriel Dufresne  
**Foundry:** USWDS (new)  
**Typeface:** Public Sans (new)  
**Source URL:** https://fonts.google.com/specimen/Public+Sans?preview.script=Latn  

---

## Step 0 — Duplicate Check

```bash
npm run check -- --foundry uswds --typeface public-sans
```

**Result:**
- Foundry `uswds` — not found, new entry required
- Typeface `public-sans` — not found, clear to proceed

---

## Step 1 — Page Extraction

**Method:** Playwright `main.innerText` (Google Fonts is JS-rendered; WebFetch returned empty)

**Specimen page** (`/specimen/Public+Sans`):
- Typeface name: Public Sans
- Designers: USWDS, Dan Williams, Pablo Impallari, Rodrigo Fuenzalida
- Classification (Google tag): Sans Serif — Grotesque
- Technology: Variable
- Styles: Thin 100 through Black 900, all with matching Italics (18 total styles)
- Moods (Google tags): Calm, Business, Vintage, Rugged, Loud, Stiff

**About page** (`/specimen/Public+Sans/about`):
- "Based on Libre Franklin, Public Sans is a strong, neutral typeface for interfaces, text, and headings. It was Developed by the United States Web Design System. The family was upgraded to a variable font in May 2022."
- 350 million API serves per week · featured on 101,000+ websites

**Glyphs/Language tab** (`/specimen/Public+Sans/glyphs`):
- 515 languages supported across Africa (191), Europe (103), Americas (116), Asia (78), Oceania (27)

**Foundry page** — `public-sans.digital.gov` (linked from the Google Fonts specimen page):
- Used to confirm official name and as the specimen capture URL — fonts load cleanly under `"Public Sans Web"` family name

**USWDS about** — `designsystem.digital.gov`:
- U.S. federal government design system, created by General Services Administration
- Location: Washington, D.C., USA

---

## Step 2 — Font Family Identification

**Method:** Playwright `document.fonts` eval on `public-sans.digital.gov`

The Google Fonts specimen page loads Public Sans under an internal name (`"gf_Public_Sans variant0"`) at weight 400 only. The official USWDS microsite loads all weights cleanly under a readable name:

```
Public Sans Web  (weights: 100–900, status: loaded)
```

**Decision:** Use `public-sans.digital.gov` as the specimen URL with `--font-family "Public Sans Web"`. Regular at weight 400, heavy at weight 900.

---

## Step 3 — Variant Detection

**Result:** No variants. One record.

Public Sans is a single-design family — weights and italics only, no optical variant split (no Condensed, Display, Mono, etc. sub-styles).

---

## Step 4 — Schema Fields

### Foundry — `foundry-uswds` (new)

| Field | Value |
|---|---|
| name | USWDS |
| slug | uswds |
| location | Washington, D.C., USA |
| website | https://designsystem.digital.gov |
| foundryType | open-source |
| description | "USWDS (U.S. Web Design System) is an open-source design system created by the United States General Services Administration to help federal agencies build accessible, consistent digital experiences. Its type and visual design assets, including Public Sans, are released as free, open-source resources under the SIL Open Font License." |

### Typeface — `typeface-public-sans` (new)

| Field | Value | Notes |
|---|---|---|
| name | Public Sans | — |
| slug | public-sans | — |
| classification | sans-serif | — |
| subClassification | Grotesque | Google's own tag; confirmed by monolinear strokes and two-storey `g` |
| personalityTags | Neutral, Functional, Authoritative, Serious, Approachable | "Strong, neutral" from description; Functional for interface-first design; Authoritative for government origin; Approachable because it avoids coldness despite institutional use |
| useCaseTags | Digital UI, Body Text, Headline, Short Copy, Wayfinding | Primary use cases stated by USWDS; Wayfinding added for government signage context |
| era | Contemporary, Modernist | Designed 2019, updated 2022; grotesque roots in Modernist tradition |
| weightRange | thin, light, regular, medium, semibold, bold, extrabold, black | Full range — Thin 100 through Black 900 |
| width | normal | — |
| contrast | monolinear | Even stroke weight throughout; grotesque construction |
| xHeight | tall | Inherited from Libre Franklin; optimised for screen legibility |
| licensing | free | Google Fonts + SIL Open Font License |
| platforms | google-fonts | — |
| variableFont | true | Upgraded to variable font May 2022 (stated on About page) |
| hasItalics | true | All 9 weights have matching italics |
| multilingualSupport | true | 515 languages across 5 regions |
| featured | false | Standard intake default |

**rawKeywords:** USWDS, U.S. Web Design System, United States Web Design System, Dan Williams, Pablo Impallari, Rodrigo Fuenzalida, Libre Franklin, Franklin Gothic, government, federal, open source, 2019, GSA, General Services Administration, digital.gov, SIL Open Font License

---

## Step 5 — Specimen Capture

**Regular:**
```bash
npm run specimen -- \
  --foundry uswds \
  --typeface public-sans \
  --font-family "Public Sans Web" \
  --text "Public Sans" \
  --url https://public-sans.digital.gov
```
Output: `specimens/uswds_public-sans_specimen.jpg` — 709×176px (1418×352px @2×) · 37KB

**Heavy:**
```bash
npm run specimen -- \
  --foundry uswds \
  --typeface public-sans \
  --font-family "Public Sans Web" \
  --text "Public Sans" \
  --url https://public-sans.digital.gov \
  --weight 900 \
  --heavy
```
Output: `specimens/uswds_public-sans_specimen_heavy.jpg` — 742×176px (1484×352px @2×) · 34KB

**Specimen review:** Both clean — white background, typeface name as display text. Regular is clearly humanist-leaning with open apertures; heavy is visually distinct with tight counters and heavy ink mass. Both worth keeping.

---

## Step 6 — Editorial Note

**Tier assessment:** Rich — Google Fonts About page has 3 clear sentences of foundry copy.

**Draft (compressed from source):**
> Based on Libre Franklin, Public Sans is a strong, neutral typeface for interfaces, text, and headings, developed by the United States Web Design System and upgraded to a variable font in May 2022.

**Source basis:** Direct compression of Google Fonts' own copy. Language and voice preserved exactly; two sentences merged into one for brevity.

---

## Step 7 — intake-data.js

Edited `scripts/intake-data.js`:

- `FOUNDRY`: full object for new foundry `foundry-uswds`
- `SHARED`: weightRange full 8-weight range, variableFont `true`, licensing `free`, platforms `google-fonts`, multilingualSupport `true`, hasItalics `true`
- `TYPEFACES`: one entry — `typeface-public-sans` with both specimen files

---

## Step 8 — Push

```bash
npm run push
```

**Output:**
```
Uploading specimens…
  → Uploading uswds_public-sans_specimen.jpg…
    ✓ Asset ID: image-1515d2d608caf74114d70738abb81f5cc224e946-1418x352-jpg
  → Uploading uswds_public-sans_specimen_heavy.jpg…
    ✓ Asset ID: image-ac6cceca96629965c53a72eecaec5e44f2013538-1484x352-jpg

Creating foundry…
  ✓ foundry-uswds created

Creating typefaces…
  ✓ typeface-public-sans created

✓ All done. Records are live in Sanity.
```

---

## Step 9 — Verification

Verified live at `localhost:3000` — search for "public sans":

- Public Sans appears as first result with **STRONG MATCH**
- Specimen renders correctly — heavy weight displayed on card
- Tags shown: SANS-SERIF · GROTESQUE · 8 WEIGHTS · ITALICS · VARIABLE
- Foundry attribution: USWDS · WASHINGTON, D.C., USA
- No heavy specimen removed (visually distinct — kept)

---

*TypeScout intake log — August Strategy*
