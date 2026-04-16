# Intake Session Log — Grotta (Due Studio)
**Date:** 2026-04-15  
**URL:** https://www.due-studio.com/typefaces/grotta  
**Outcome:** ✅ Pushed successfully (foundry + typeface)

---

## What Went Well

- Duplicate check was clean and fast.
- Font family name `"grotta"` (lowercase) was identifiable via Tier 3 — a textarea element with `class="grotta"` and `font-family: grotta`.
- Both specimens captured cleanly after finding the right clip bounds.
- The interactive type tester allowed switching to Heavy weight and typing custom text (`Ggr`) to produce the heavy specimen without needing a separate page state.
- The full metadata (weights, description, designers, encoding) was legible directly from the WebFetch output and confirmed in the fullPage screenshot.

---

## Friction Points & What Caused Them

### 1. Playwright not found at `/tmp`
The first Node script ran from `/tmp` and failed because Playwright isn't installed globally — it lives in the project's `node_modules`. Every subsequent script needed to run from the project directory (`typescout/`) or explicitly require from the project path.

**Fix for instructions:** Always run Playwright scripts via `cd typescout && node -e "..."` or use a script in `scripts/`. Never run from `/tmp`.

---

### 2. Tier 2 produced a misleading font list
`document.fonts` returned:
- `"grotta"` with status `"error"` (CSS @font-face declared but not yet loaded)
- Per-weight families (`"Thin"`, `"Light"`, `"Regular"`, etc.) all with status `"unloaded"`

This looked like nothing useful was loaded. In reality, the font **was** rendering on screen — the `"error"` status just meant the font wasn't pre-loaded via the API, it loaded on demand via CSS. The `"unloaded"` weights were registered but not yet triggered.

**Fix for instructions:** `"error"` in `document.fonts` doesn't mean the font is broken — it may still render via CSS demand loading. Always take a screenshot alongside Tier 2 to confirm visual rendering before concluding the font isn't available.

---

### 3. Tier 3 DOM search returned empty on first pass
The initial Tier 3 search looked for elements whose `fontFamily` exactly matched per-weight names (`"Thin"`, `"Light"`, etc.). It returned nothing because those weights weren't yet active in the DOM. The actual display element was a `<textarea>` using `font-family: grotta` (the base family name) — a pattern not covered by the initial search.

**Fix for instructions:** Tier 3 should always include a catch-all branch: after filtering for known weight names, also search for *any* element whose font-family doesn't match the site's UI font. This would have found the textarea immediately.

---

### 4. The specimen slider had 15 invisible dots
The main hero slider had 15 navigation dots (one per sample text slide), all marked `w-condition-invisible` and not clickable. Attempting to click them caused a 30-second timeout. The slider showed regular weight text and couldn't be navigated to other weights this way.

**Fix for instructions:** Before attempting to click slider dots, check if they have `w-condition-invisible` (Webflow's visibility condition class) and skip that approach early. Look for the interactive type tester section instead.

---

### 5. Font style buttons were off-screen (y=1049 in a 900px viewport)
The right-side Styles panel was below the fold. The first DOM query found the buttons but their `getBoundingClientRect` showed `y=1049+`, meaning they weren't in view. Clicking them required `element.click()` via `page.evaluate()` (which bypasses viewport constraints) rather than Playwright's `locator.click()` (which requires visibility).

**Fix for instructions:** When style/weight selectors are off-screen, use `page.evaluate(() => el.click())` instead of Playwright locator clicks. Alternatively, scroll the element into view first with `scrollIntoView({ block: 'center', behavior: 'instant' })`.

---

### 6. `page.keyboard.selectAll()` doesn't exist
Used to clear the textarea before typing the specimen text. Playwright's keyboard API doesn't have a `selectAll()` method — the correct approaches are `Ctrl+A` (`page.keyboard.press('Control+a')`) or clicking with `clickCount: 3` to triple-click and select all.

**Fix for instructions:** To clear a textarea: use `await textarea.click({ clickCount: 3 })` then type. Don't use `page.keyboard.selectAll()`.

---

### 7. Multiple screenshot iterations to find correct crop bounds
The first crop attempt (`y=50, height=420`) cut off the top of the letterforms because the letters extended higher than expected. Required 3-4 screenshot iterations to land on good clip bounds. 

**Fix for instructions:** Before cropping, always query the bounding box of the target element (`getBoundingClientRect`) and use those values directly as the clip. Don't guess `y` offsets — derive them from the DOM.

---

## Suggested Intake Workflow Improvements

### System prompt / instructions to add:

```
PLAYWRIGHT SETUP
- Always run Node/Playwright scripts from the typescout/ directory (cd typescout first).
  Playwright lives in typescout/node_modules, not globally.

TIER 2 CAVEAT
- document.fonts status "error" does not mean the font is broken.
  Always take a screenshot alongside Tier 2 to confirm visual rendering.
  A font with status "error" may still render on screen via CSS demand loading.

TIER 3 CATCH-ALL
- If Tier 3 search for known weight-name families returns empty,
  run a second pass: find any element whose fontFamily differs from
  the site's main UI font. Textareas and canvas elements often carry
  the display font.

WEBFLOW SITES
- Webflow slider dots have class "w-slider-dot". If they also carry
  "w-condition-invisible", they are not user-clickable — skip dot navigation.
- Interactive type testers on foundry sites often live well below the fold
  (y > 900px). Use page.evaluate(() => el.click()) for off-screen controls.

CLEARING A TEXTAREA
- Use: await textarea.click({ clickCount: 3 }); await page.keyboard.type('...');
- Do NOT use: page.keyboard.selectAll() — this method does not exist.

SCREENSHOT CROPS
- Query getBoundingClientRect() for the target element before cropping.
  Use the returned x, y, width, height directly as the clip object.
  Never guess pixel offsets.
```

---

## Typeface Notes

- **Weight taxonomy note:** Grotta's heaviest weight is called "Heavy" (heavier than Black). Mapped to `black` in our taxonomy since Heavy is outside our controlled vocabulary. Worth noting in rawKeywords.
- **Std / Alt variants:** Grotta has Std and Alt sub-families (essentially stylistic set defaults), not separate optical sizes. Correct to treat as one Sanity record.
- **`width` field:** Was in the typeface object but the push script's `createOrReplace` call was missing `width`. Fixed inline during this session — the field is now being written.
- **Contrast:** Called "sharp contrast" in the product description, which is unusual for a grotesk. Mapped to `medium` because the contrast is notable for a sans but low by display serif standards. Worth revisiting if the design system gets a dedicated grotesk contrast scale.
