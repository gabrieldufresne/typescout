# Typeface Screenshot Tool

Captures a clean specimen image for any typeface — the name set in that font, black on white, cropped to the text bounding box — using a headless Chromium browser launched against the foundry's own page. Because the font is already loaded in the browser context, no font files are downloaded or embedded locally.

---

## How it works

1. A headless Chromium browser navigates to the foundry page at the URL you provide
2. It waits for all web fonts on that page to finish loading (`document.fonts.ready`)
3. A specimen overlay is injected into the DOM — white background, the typeface name set in the target font at 120px
4. The Canvas 2D API measures the exact text bounding box (ascent + descent + width)
5. A JPEG screenshot is taken of just that overlay, cropped to the measured bounds
6. The file is saved to `specimens/` using the PRD naming convention

---

## Mandatory: overlay injection only

**The overlay injection approach is the only permitted capture method.** Never screenshot the foundry's own UI — not the type tester, not the hero section, not a slider slide. If the foundry's page has an interactive type tester, it is useful for identifying font family names, not for capturing specimens.

The overlay guarantees:
- White background (`#ffffff`) on every specimen, always
- Display text controlled by `--text` (always the typeface name, never arbitrary sample text like "Ggr")
- Consistent 120px render size and 2× resolution

If the overlay renders in a fallback serif, diagnose the font family name — do not work around it by screenshotting the page. A specimen with the wrong background or wrong text will look broken in the TypeScout UI and will need to be recaptured.

---

## Multi-variant typefaces

If a typeface family includes distinct stylistic variants — **not just weights**, but genuinely different optical styles such as Sans, Serif, Flare, Mono, Stencil, Display, Condensed, Rounded, etc. — **create a separate TypeScout record for each variant.**

Each variant record gets:
- Its own slug (e.g. `lorne-sans`, `lorne-serif`, `lorne-flare`)
- Its own primary specimen (Regular weight of that variant)
- Its own heavy specimen (Black/ExtraBold of that variant, if meaningfully different)

**How to identify variants:** Check the loaded CSS font families on the page. If you see names like `Lorne Sans Regular`, `Lorne Flare Regular`, `Lorne Serif Regular`, those are variants — not just weights of the same design. A variant has a different optical character at the same weight; weights differ only in stroke thickness.

**Example — Lorne Variable (Juri Zaech):**
```bash
# Three separate records: lorne-sans, lorne-flare, lorne-serif
# Each captured against the same foundry URL where all variants are loaded

npm run specimen -- --foundry juri-zaech --typeface lorne-sans \
  --font-family "Lorne Sans Regular" --text "Lorne" \
  --url https://www.juri-zaech.com/fonts/lorne-variable

npm run specimen -- --foundry juri-zaech --typeface lorne-sans \
  --font-family "Lorne Sans Black" --text "Lorne" \
  --url https://www.juri-zaech.com/fonts/lorne-variable --heavy

# Repeat for lorne-flare and lorne-serif
```

---

## Image resolution

All specimens are captured at **2× resolution** (`deviceScaleFactor: 2` in the capture script). This is baked in — no flag needed. A CSS bounding box of ~400×200px produces a ~800×400px output JPEG, suitable for retina displays.

Do not change `deviceScaleFactor` unless you have a specific reason. The 2× setting is the standard for all TypeScout specimens.

---

## Weight selection rule

Always capture the **Regular** weight as the primary specimen.

| Priority | Weight name | CSS value to use |
|---|---|---|
| 1 — Preferred | Regular | `ScatchRegular`, `GT AmericaRegular`, etc. |
| 2 — Fallback | Book | CSS family name containing `Book`, or numerical weight `500` |
| 3 — Last resort | Normal / Roman | numerical weight `400` |

**How to identify the available CSS family names on any foundry page:**

Work through the three tiers in order. Stop as soon as you have a confirmed family name.

---

### Tier 1 — Try the typeface name directly (no lookup needed)

Run the specimen capture with the typeface name as `--font-family`. If the output renders correctly, done.

```bash
npm run specimen -- --foundry <slug> --typeface <slug> \
  --font-family "Chap" --text "Chap" --url <url>
```

Most foundries (Grilli Type, Klim, Commercial Type) use plain readable names. This covers the majority of intakes.

---

### Tier 2 — `document.fonts` eval (eagerly loaded fonts)

If Tier 1 renders a fallback serif, the foundry registers each weight as its own CSS family. Open a Playwright session and list what is loaded:

```bash
playwright-cli -s=intake open <url>
playwright-cli -s=intake eval "JSON.stringify([...document.fonts].map(f => ({family: f.family, weight: f.weight, status: f.status})))"
```

Scan the output for the name that best matches Regular → Book → 400. Use that string as `--font-family`. Note: fonts with `"error"` status may still render correctly — see the caveat below.

This covers foundries like Tipografies (readable names: `ScatchRegular`) and Sharp Type (UUID names loaded on page init via `<select>` elements).

> **`"error"` status does not mean the font is broken.** `document.fonts` may report a font as `"error"` when it is CSS demand-loaded rather than pre-fetched — it can still render correctly on screen. If you see `"error"` alongside a plausible family name, try using that name as `--font-family` before concluding the font is unavailable. Always take a screenshot alongside Tier 2 to confirm visual rendering.

---

### Tier 3 — Network interception + DOM cross-reference (lazy-loaded fonts)

If `document.fonts` returns only UI fonts and no typeface families, the page loads fonts lazily (on user interaction). Do not attempt to trigger those interactions — instead, intercept the network and map the loaded UUIDs to weight labels via the DOM.

**Step 1 — Confirm lazy loading by checking network requests:**

```bash
playwright-cli -s=intake open <url>
playwright-cli -s=intake eval "Array.from(performance.getEntriesByType('resource')).filter(function(r) { return r.name.includes('font') || r.name.includes('woff') || r.name.includes('/api/fonts'); }).map(function(r) { return r.name; }).slice(0,20)"
```

If you see `/api/fonts/<uuid>` or hashed `.woff` paths, the fonts are obfuscated and lazy-loaded.

**Step 2 — Get @font-face family names after full page load:**

```bash
playwright-cli -s=intake eval "Array.from(document.styleSheets).flatMap(function(s) { try { return Array.from(s.cssRules) } catch(e) { return [] } }).filter(function(r) { return r.constructor.name === 'CSSFontFaceRule'; }).map(function(r) { return r.style.fontFamily + ' w=' + r.style.fontWeight; })"
```

This lists all UUID family names the page has registered.

**Step 3 — Cross-reference UUIDs to weight labels via the DOM:**

```bash
playwright-cli -s=intake eval "Array.from(document.querySelectorAll('*')).filter(function(el) { var ff = window.getComputedStyle(el).fontFamily; return ff && el.children.length === 0 && el.textContent.trim().length > 3; }).slice(0,30).map(function(el) { return window.getComputedStyle(el).fontFamily.split(',')[0].trim() + ' | ' + el.textContent.trim().slice(0,40); })"
```

This produces lines like `cijkd17x100020rx4ig6o33yw | Chap Regular` and `cijkd17x4000a0rx4fxeugomu | Chap Black`, mapping each UUID to the weight label text it renders next to. Pick the UUID for Regular and Black.

> This pattern was first encountered with Schick Toikka. Their fonts load on page init but are registered under API-served UUIDs rather than readable names — so `document.fonts` returns them, but Tier 2's output is unreadable without the DOM cross-reference step.

**Tier 3 catch-all — if the above returns empty:**

If the weight-name search returns nothing (because the active element uses the base family name rather than per-weight names), run a second pass that finds any element whose font-family differs from the site's main UI font. Textareas, canvas elements, and type tester inputs commonly carry the display font:

```bash
playwright-cli -s=intake eval "Array.from(document.querySelectorAll('textarea, canvas, [class*='type'], [class*='sample'], [class*='specimen']')).map(function(el) { return window.getComputedStyle(el).fontFamily.split(',')[0].trim() + ' | tag=' + el.tagName + ' class=' + el.className.slice(0,40); }).filter(function(s) { return s.length > 5; })"
```

This catches cases where the display font is applied to a single prominent element using the base family name (e.g. `font-family: grotta`) rather than a weight-specific variant.

---

## Interacting with foundry pages via Playwright

Some foundry sites require page interaction to identify font family names or confirm weight rendering. A few patterns come up repeatedly.

**Interactive controls below the fold**

Style selectors, weight pickers, and type tester controls often sit below the visible viewport (e.g. `y > 900px` in a 900px viewport). Playwright's `locator.click()` requires the element to be in view — it will time out on off-screen elements. Use `page.evaluate()` to bypass the viewport constraint:

```js
await page.evaluate(() => document.querySelector('.weight-selector').click());
```

Or scroll the element into view first:
```js
await page.evaluate(() => document.querySelector('.weight-selector').scrollIntoView({ block: 'center', behavior: 'instant' }));
await page.click('.weight-selector');
```

**Navigation dots and slider controls**

Before clicking any navigation dot or similar control, check whether it carries a visibility or hidden class. A dot present in the DOM but marked invisible is not user-clickable — attempting to click it will time out. Check first:

```js
await page.evaluate(() => document.querySelector('.slider-dot')?.className);
```

If the class list includes a visibility/hidden marker, skip that navigation approach and look for the interactive type tester section instead — it is typically a separate component further down the page.

**Clearing a textarea before typing**

To clear a textarea and type new specimen text:
```js
await textarea.click({ clickCount: 3 }); // select all
await page.keyboard.type('Typeface Name');
```

Do **not** use `page.keyboard.selectAll()` — this method does not exist in Playwright's keyboard API.

**Screenshot crops — always derive from the DOM**

Never guess pixel offsets for a crop. Always query the bounding box of the target element first and use those values directly:

```js
const box = await page.evaluate(() => {
  const el = document.querySelector('#target-element');
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
await page.screenshot({ clip: box });
```

Guessed offsets (`y: 50, height: 420`) will cut off letterforms and require multiple iterations to fix.

---

## Usage

```bash
node scripts/capture-specimen.js \
  --foundry  <foundry-slug> \
  --typeface <typeface-slug> \
  --font-family "<CSS font-family name>" \
  --url      <foundry page URL> \
  [--text    "<display text>"] \
  [--weight  <font-weight>] \
  [--heavy]
```

Or via the npm shortcut:

```bash
npm run specimen -- \
  --foundry  <foundry-slug> \
  --typeface <typeface-slug> \
  --font-family "<CSS font-family name>" \
  --url      <foundry page URL>
```

### Arguments

| Flag | Required | Description |
|---|---|---|
| `--foundry` | Yes | Foundry slug — lowercase, hyphens. e.g. `grilli-type` |
| `--typeface` | Yes | Typeface slug — lowercase, hyphens. e.g. `gt-america` |
| `--font-family` | Yes | Exact CSS font-family name as loaded on the page. e.g. `"GT AmericaRegular"` |
| `--url` | Yes | Foundry page URL where the font is loaded |
| `--text` | No | Display text to render. Defaults to the value of `--font-family`. Use this when the CSS family name differs from the typeface name (e.g. `--text "Scatch"` when the family is `ScatchRegular`) |
| `--weight` | No | CSS font-weight value. Defaults to `400`. Use `500` for Book weight |
| `--heavy` | No | Flag only — no value. Appends `_heavy` to the output filename for the Black/ExtraBold specimen |

---

## Output

Files are saved to `specimens/` in the project root, following the PRD naming convention:

```
specimens/foundry-slug_typeface-slug_specimen.jpg         ← regular weight
specimens/foundry-slug_typeface-slug_specimen_heavy.jpg   ← heavy weight (--heavy flag)
```

**Examples:**
```
specimens/tipografies_scatch_specimen.jpg
specimens/tipografies_scatch_specimen_heavy.jpg
specimens/grilli-type_gt-america_specimen.jpg
specimens/klim_tiempos-headline_specimen.jpg
```

---

## Step-by-step intake example

This is the full process used for Scatch (Tipografies.com). Note: this foundry registers each weight as its own CSS family — a case where the font family eval is necessary.

**Step 1 — Try the typeface name as the CSS family**

Attempt capture with the typeface name directly:

```bash
npm run specimen -- \
  --foundry tipografies \
  --typeface scatch \
  --font-family "Scatch" \
  --text "Scatch" \
  --url https://tipografies.com/fonts/scatch
```

If the output renders correctly, skip Step 2. If it renders in a fallback serif, proceed.

**Step 2 — Identify the loaded CSS font families (fallback only)**

```bash
playwright-cli -s=intake open https://tipografies.com/fonts/scatch
playwright-cli -s=intake eval "JSON.stringify([...document.fonts].map(f => ({family: f.family, weight: f.weight, status: f.status})))"
```

Output excerpt:
```json
[
  { "family": "ScatchThin",    "weight": "normal" },
  { "family": "ScatchLight",   "weight": "normal" },
  { "family": "ScatchRegular", "weight": "normal" },
  { "family": "ScatchMedium",  "weight": "normal" },
  { "family": "ScatchBold",    "weight": "normal" },
  { "family": "ScatchBlack",   "weight": "normal" }
]
```

`ScatchRegular` matches the weight rule → use it as `--font-family`.

**Step 3 — Capture the regular specimen**

```bash
npm run specimen -- \
  --foundry tipografies \
  --typeface scatch \
  --font-family "ScatchRegular" \
  --text "Scatch" \
  --url https://tipografies.com/fonts/scatch
```

**Step 4 — Capture the heavy specimen (optional — only if Black/ExtraBold is meaningfully different)**

```bash
npm run specimen -- \
  --foundry tipografies \
  --typeface scatch \
  --font-family "ScatchBlack" \
  --text "Scatch" \
  --url https://tipografies.com/fonts/scatch \
  --heavy
```

**Step 5 — Push to Sanity**

After the full intake record is drafted and approved:

```bash
npm run push
```

---

## Troubleshooting

**SSL error (`net::ERR_SSL_PROTOCOL_ERROR`)**
Some foundry sites have misconfigured certificates that headless Chromium rejects. The script has `ignoreHTTPSErrors: true` enabled by default. If errors persist, try running the capture solo (not in parallel with another capture).

**Specimen renders in a fallback serif instead of the target font**
The `--font-family` value doesn't match any loaded font on the page. Run the Step 2 eval command to get the exact family names, then retry.

**Output looks correct but the foundry name is in the text instead of the typeface name**
You need the `--text` flag. This happens when the CSS family name differs from the typeface name (e.g. `ScatchRegular` vs `Scatch`). Add `--text "Typeface Name"` to your command.
