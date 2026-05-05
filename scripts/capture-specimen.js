/**
 * capture-specimen.js
 *
 * Navigates to a foundry page (where the font is already loaded), injects a
 * clean specimen element, measures exact text bounds via canvas API, and saves
 * a cropped JPEG using the PRD naming convention.
 *
 * Usage:
 *   node scripts/capture-specimen.js \
 *     --foundry grilli-type \
 *     --typeface gt-america \
 *     --font-family "GT America" \
 *     --url https://www.grillitype.com/typeface/gt-america \
 *     [--weight 400] \
 *     [--heavy]
 *
 * Output:
 *   specimens/grilli-type_gt-america_specimen.jpg      (regular)
 *   specimens/grilli-type_gt-america_specimen_heavy.jpg (with --heavy flag)
 *
 * After capture, upload the file to Sanity via the Studio or intake session.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const foundry    = getArg('--foundry');
const typeface   = getArg('--typeface');
const fontFamily = getArg('--font-family');
const url        = getArg('--url');
const weight      = getArg('--weight') ?? '400';
const fontStretch = getArg('--font-stretch') ?? 'normal'; // CSS font-stretch keyword, e.g. "condensed"
const isHeavy     = args.includes('--heavy');
// Optional: display text different from the CSS family name (e.g. when each weight
// is its own family like "ScatchRegular"). Defaults to fontFamily if not provided.
const displayText = getArg('--text') ?? null;
// Optional: direct font file URL — bypasses the page's CSS family lookup by
// registering a stable @font-face under "__ts_target__". Required when the
// foundry obfuscates family names with session-randomized IDs (e.g. Type of
// Feeling's F_1777383467_19 pattern).
const fontUrl = getArg('--font-url');

if (!foundry || !typeface || !url || (!fontFamily && !fontUrl)) {
  console.error(`
Usage:
  node scripts/capture-specimen.js \\
    --foundry <slug>         e.g. grilli-type
    --typeface <slug>        e.g. gt-america
    --font-family <name>     CSS family name on the page (e.g. "GT America")
                             — OR use --font-url instead (one is required)
    [--font-url <url>]       direct woff/woff2 URL — for obfuscated family names
    [--text <label>]         display text (defaults to family name or typeface slug)
    --url <url>              foundry page where the font is loaded
    [--weight <number>]      font-weight to render (default: 400)
    [--font-stretch <kw>]    CSS font-stretch keyword, e.g. "condensed" (default: normal)
    [--heavy]                suffix output filename with _heavy
  `);
  process.exit(1);
}

// Internal stable family name used when --font-url is provided
const STABLE_FAMILY = '__ts_target__';
const renderFamily  = fontUrl ? STABLE_FAMILY : fontFamily;

// ── Output path (PRD §09 naming convention) ───────────────────────────────────

const suffix   = isHeavy ? '_heavy' : '';
const filename = `${foundry}_${typeface}_specimen${suffix}.jpg`;
const outDir   = path.join(process.cwd(), 'specimens');
const outPath  = path.join(outDir, filename);

// ── Main ──────────────────────────────────────────────────────────────────────

async function captureSpecimen() {
  console.log(`\nTypeScout specimen capture`);
  const stretchLabel = fontStretch !== 'normal' ? ` stretch ${fontStretch}` : '';
  const sourceLabel  = fontUrl ? `font-url: ${fontUrl}` : fontFamily;
  console.log(`  Typeface : ${sourceLabel} (weight ${weight}${stretchLabel})`);
  console.log(`  Source   : ${url}`);
  console.log(`  Output   : specimens/${filename}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1800, height: 900 },
    deviceScaleFactor: 2,        // renders at 2× — output images are double the CSS pixel dimensions
    ignoreHTTPSErrors: true,     // handles self-signed or misconfigured certs on foundry sites
  });
  const page = await context.newPage();

  // Navigate to the foundry page so all fonts are loaded in their context
  console.log('→ Loading page…');
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });

  // Ensure all web fonts have finished loading
  await page.evaluate(() => document.fonts.ready);

  // Trigger lazy-loaded fonts on type-tester pages that only register @font-face
  // rules once the tester scrolls into view (e.g. giuliaboggio.xyz)
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1500));
    window.scrollTo(0, 0);
  });

  // ── Optional: register stable @font-face from --font-url ──────────────────
  // Bypasses the page's CSS family lookup. Used when the foundry obfuscates
  // family names with session-randomized IDs (e.g. Type of Feeling).
  if (fontUrl) {
    await page.evaluate(async ({ fontUrl, family, weight }) => {
      const style = document.createElement('style');
      style.textContent =
        `@font-face { font-family: ${family}; ` +
        `src: url("${fontUrl}") format("${fontUrl.endsWith('.woff') ? 'woff' : 'woff2'}"); ` +
        `font-weight: ${weight}; font-style: normal; font-display: block; }`;
      document.head.appendChild(style);
      await document.fonts.load(`${weight} 120px "${family}"`);
    }, { fontUrl, family: renderFamily, weight });
  }

  // Explicitly load the target font (covers per-weight families that load lazily)
  await page.evaluate(({ family, weight, fontStretch }) => {
    return document.fonts.load(`${fontStretch} ${weight} 120px "${family}"`);
  }, { family: renderFamily, weight, fontStretch });

  // Give late-loading fonts an extra moment
  await page.waitForTimeout(1200);

  // ── Inject specimen overlay and measure exact text bounds ──────────────────
  const clip = await page.evaluate(
    ({ fontFamily, weight, fontStretch, label }) => {
      // Remove any leftover overlay from a previous run
      document.getElementById('__ts_specimen__')?.remove();

      const FONT_SIZE = 120; // px — large enough for quality, small enough to fit
      const PADDING   = 28;  // px — consistent whitespace around the glyph bounds

      // Build the overlay — inline-flex so it naturally wraps the text content
      const overlay = document.createElement('div');
      overlay.id = '__ts_specimen__';
      Object.assign(overlay.style, {
        position:       'fixed',
        top:            '0',
        left:           '0',
        background:     '#ffffff',
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        `${PADDING}px`,
        zIndex:         '2147483647',
        overflow:       'visible',
      });

      const text = document.createElement('span');
      text.textContent = label;
      Object.assign(text.style, {
        fontFamily:  `"${fontFamily}", serif`,
        fontSize:    `${FONT_SIZE}px`,
        fontWeight:  String(weight),
        fontStretch: fontStretch || 'normal',
        color:       '#000000',
        lineHeight:  '1',
        whiteSpace:  'nowrap',
        display:     'block',
        userSelect:  'none',
      });

      overlay.appendChild(text);
      document.body.appendChild(overlay);

      // Measure actual rendered bounds — accurate for variable font width variants
      const rect   = overlay.getBoundingClientRect();
      const totalW = Math.ceil(rect.width);
      const totalH = Math.ceil(rect.height);

      return { x: 0, y: 0, width: totalW, height: totalH };
    },
    { fontFamily: renderFamily, weight, fontStretch, label: displayText ?? fontFamily ?? typeface }
  );

  // ── Screenshot ─────────────────────────────────────────────────────────────
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`→ Capturing ${clip.width}×${clip.height}px…`);
  await page.screenshot({
    path:    outPath,
    clip,
    type:    'jpeg',
    quality: 95,
  });

  // ── Font list output (always printed — useful for Tier 2/3 diagnosis) ────────
  // If the specimen rendered in a fallback serif, use this list to find the
  // correct --font-family value without needing a separate playwright-cli session.
  // "error" status does not mean the font is broken — it may still render via
  // CSS demand loading. Try the family name as --font-family before giving up.
  const fontReport = await page.evaluate(() => {
    // Layer 1: document.fonts (eagerly loaded / demand-loaded fonts)
    const loaded = [...document.fonts].map(f => ({
      family:  f.family,
      weight:  f.weight,
      status:  f.status,
    }));

    // Layer 2: CSS @font-face rules (registered even for lazy-loaded fonts)
    const faceRules = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules); } catch { return []; }
    })
    .filter(r => r.constructor.name === 'CSSFontFaceRule')
    .map(r => ({
      family: r.style.fontFamily.replace(/['"]/g, ''),
      weight: r.style.fontWeight || 'normal',
      source: '@font-face',
    }));

    return { loaded, faceRules };
  });

  await browser.close();

  const stat = fs.statSync(outPath);
  const kb   = Math.round(stat.size / 1024);

  console.log(`✓ Saved: specimens/${filename}`);
  console.log(`  ${clip.width}×${clip.height}px · ${kb}KB\n`);

  // Print font families found on the page
  const SYSTEM_FONTS = new Set([
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'system-ui',
    '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif',
    'serif', 'monospace', 'cursive', 'fantasy',
  ]);

  const seenFamilies = new Set();
  const relevant = fontReport.loaded.filter(f => {
    const clean = f.family.replace(/['"]/g, '');
    if (SYSTEM_FONTS.has(clean)) return false;
    if (seenFamilies.has(clean)) return false;
    seenFamilies.add(clean);
    return true;
  });

  if (relevant.length > 0) {
    console.log('── Fonts loaded on page ──────────────────────────────────────');
    for (const f of relevant) {
      const flag = f.status === 'error' ? '  ← "error" status — may still render via CSS demand loading' : '';
      console.log(`  ${f.family}  (weight: ${f.weight}, status: ${f.status})${flag}`);
    }
    // Layer 2: show @font-face families not already listed (catches lazy-loaded UUIDs)
    const faceOnly = fontReport.faceRules.filter(f => !seenFamilies.has(f.family));
    if (faceOnly.length > 0) {
      console.log('  — Additional @font-face families (may be lazy-loaded):');
      for (const f of faceOnly) {
        console.log(`  ${f.family}  (weight: ${f.weight})`);
      }
    }
    console.log('──────────────────────────────────────────────────────────────\n');
  } else {
    console.log('── No non-system fonts detected on page ──────────────────────');
    console.log('   If the specimen is a fallback serif, check @font-face rules:\n');
    for (const f of fontReport.faceRules) {
      console.log(`  ${f.family}  (weight: ${f.weight})`);
    }
    console.log('──────────────────────────────────────────────────────────────\n');
  }

  const recordLabel = displayText ?? fontFamily ?? typeface;
  console.log(`Next: upload to Sanity as the specimenImage field on the "${recordLabel}" record.\n`);
}

captureSpecimen().catch((err) => {
  console.error(`\n✗ Error: ${err.message}\n`);
  process.exit(1);
});
