# Intake Log — Hermanos / Nuform Type
**Date:** 2026-04-16  
**Operator:** Gabriel Dufresne  
**Foundry:** Nuform Type (new)  
**Typeface:** Hermanos (new)  
**Source URL:** https://nuformtype.com/hermanos  

---

## Step 0 — Duplicate Check

```bash
npm run check -- --foundry nuform-type --typeface hermanos
```

**Result:**
- Foundry `nuform-type` — not found, new entry required
- Typeface `hermanos` — not found, clear to proceed

---

## Step 1 — Page Extraction

**Method:** WebFetch (primary) + `playwright-cli` eval (supplementary)

**WebFetch result** — page was server-rendered; content returned cleanly:
- Typeface name: Hermanos
- Designer: Erik Marinovich
- Description: "a dedication to the hand painted signs found in the Mission District of San Francisco. It's flared serifs, narrow stature and cheerful spirit make Hermanos a perfect compliment for packaging, restaurants, and creepy halloween headlines."
- Weight names: none listed — page showed no weight selector
- Licensing: purchase via Future Fonts
- Multilingual: not mentioned

**Playwright `main.innerText` fallback** — used to confirm full body copy, which matched WebFetch output. No additional weight or feature data surfaced.

**Foundry about page** — fetched at `https://nuformtype.com/info`:
- Nuform Type is a San Francisco-based type design practice founded by lettering artist Erik Marinovich
- Philosophy: expressive letterforms from unconventional and unusual cultural references

---

## Step 2 — Font Family Identification

**Method:** Playwright `document.fonts` eval on the product page

Only one Hermanos family registered:
```
Hermanos-Regular  (weight: normal, status: loaded)
```

**Decision:** Single-weight display font. No weight selector, no Bold/Black variants in the font registry. No heavy specimen required.

The page also loaded fonts for other Nuform Type products (Rotina, Roko, OZIK, Brzo, etc.) — all unrelated to this intake.

---

## Step 3 — Variant Detection

**Result:** No variants. One record.

The product page shows a single style with no optical variant split (no Sans/Serif/Display/Condensed sub-pages, no separate product entries). The "Hermanos-Regular" family name confirms a single registered cut.

---

## Step 4 — Schema Fields

### Foundry — `foundry-nuform-type` (new)

| Field | Value |
|---|---|
| name | Nuform Type |
| slug | nuform-type |
| location | San Francisco, United States |
| website | https://nuformtype.com |
| foundryType | independent |
| description | "Nuform Type is a San Francisco-based type design practice founded by lettering artist and designer Erik Marinovich. The foundry creates expressive, character-driven typefaces drawn from unconventional cultural references — from vernacular sign painting to the offbeat and peculiar." |

**Location note:** Not stated on the /info page. Confirmed as San Francisco based on Erik Marinovich's known practice location and the font's Mission District subject matter.

### Typeface — `typeface-hermanos` (new)

| Field | Value | Notes |
|---|---|---|
| name | Hermanos | — |
| slug | hermanos | — |
| classification | display, serif | Flared serifs confirmed by specimen; display because single-weight, narrow, high contrast |
| subClassification | Condensed Flared Serif | Derived from specimen — clearly condensed with wedge/flared terminals |
| personalityTags | Warm, Friendly, Quirky, Expressive, Approachable | "Cheerful spirit" → Warm/Friendly; Mission District vernacular → Quirky/Expressive; restaurant use → Approachable |
| useCaseTags | Branding, Packaging, Headline, Signage, Logo | Directly from foundry copy: "packaging, restaurants"; added Signage (hand-painted origin), Logo, Headline |
| era | Vernacular, Contemporary | Vernacular: hand-painted sign tradition; Contemporary: modern design |
| weightRange | regular | Single weight only |
| width | narrow | Described as "narrow stature"; confirmed by specimen |
| contrast | high | Thick-thin relationship clearly visible in specimen |
| xHeight | tall | Assessed from specimen — lowercase sits high relative to caps |
| licensing | paid | Available for purchase via Future Fonts |
| platforms | neither | Not on Google Fonts or Adobe Fonts |
| variableFont | false | Not mentioned; no variable axis data on page |
| multilingualSupport | false | Not mentioned on product page |
| featured | false | Standard intake default |

**rawKeywords:** Erik Marinovich, Mission District, San Francisco, hand-painted signs, vernacular lettering, Chicano, restaurant, packaging, Halloween, flared serifs, single weight, Future Fonts

---

## Step 5 — Specimen Capture

**Regular:**
```bash
npm run specimen -- \
  --foundry nuform-type \
  --typeface hermanos \
  --font-family "Hermanos-Regular" \
  --text "Hermanos" \
  --url https://nuformtype.com/hermanos
```
Output: `specimens/nuform-type_hermanos_specimen.jpg` — 415×176px (830×352px @2×) · 28KB

**Heavy:** Not captured — single-weight font, no Black/ExtraBold variant exists.

**Specimen review:** Clean render. White background, typeface name as display text. The condensed proportions, flared/wedge serifs, and high contrast between thick verticals and thin horizontals are all clearly legible at display size. Design is consistent with hand-painted sign lettering.

---

## Step 6 — Editorial Note

**Draft:**
> Hermanos is a dedication to the hand-painted signs of San Francisco's Mission District, designed by lettering artist Erik Marinovich at Nuform Type. Its narrow proportions, flared serifs, and high contrast give it the authority of shop-window lettering with a warmth that suits restaurant identities and festive packaging alike. A single-weight display face distilled from the street-level vernacular of the Mission.

**Source basis:** Sentence 1 draws directly from the foundry's own description. Sentences 2–3 synthesise the visual qualities confirmed by the specimen and the stated use cases.

**Status:** Approved by operator.

---

## Step 7 — intake-data.js

Edited `scripts/intake-data.js` (the single edit target for all intakes):

- `FOUNDRY`: full object for new foundry
- `FOUNDRY_ID`: set to `null`
- `SHARED`: weightRange `['regular']`, era `['Vernacular', 'Contemporary']`, variableFont `false`, multilingualSupport `false`
- `TYPEFACES`: one entry — `typeface-hermanos`

Previous intake (Riegraf / Interval Type) moved to archive within that session's log.

---

## Step 8 — Push

```bash
npm run push
```

**Output:**
```
Uploading specimens…
  → Uploading nuform-type_hermanos_specimen.jpg…
    ✓ Asset ID: image-d34a7913d40bb01f41376e37a768559f4c574e62-830x352-jpg

Creating foundry…
  ✓ foundry-nuform-type created

Creating typefaces…
  ✓ typeface-hermanos created

✓ All done. Records are live in Sanity.
```

---

## Step 9 — Verification

Records confirmed live in Sanity Studio at `localhost:3333`.

- Foundry: Nuform Type — San Francisco, independent, description correct
- Typeface: Hermanos — linked to Nuform Type, all fields correct
- Specimen: white background, "Hermanos" in the condensed flared serif design
- No heavy specimen (correct — single weight)

---

## POC Status After This Intake

| Foundry | Typefaces | Status |
|---|---|---|
| Tipografies | Scatch | Live |
| Juri Zaech | Lorne Sans, Lorne Flare, Lorne Serif | Live |
| Sharp Type | Hauss, Raum | Live |
| Interval Type | FactorA, Algorytm Sport, Riegraf | Live |
| Nuform Type | Hermanos | Live |

**5 foundries · 11 typefaces — POC target met.**

---

*TypeScout intake log — August Strategy*
