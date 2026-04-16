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
const weight     = getArg('--weight') ?? '400';
const isHeavy    = args.includes('--heavy');
// Optional: display text different from the CSS family name (e.g. when each weight
// is its own family like "ScatchRegular"). Defaults to fontFamily if not provided.
const displayText = getArg('--text') ?? null;

if (!foundry || !typeface || !fontFamily || !url) {
  console.error(`
Usage:
  node scripts/capture-specimen.js \\
    --foundry <slug>         e.g. grilli-type
    --typeface <slug>        e.g. gt-america
    --font-family <name>     e.g. "GT America"  (must match CSS font-family on the page)
    [--text <label>]         display text if different from font-family (e.g. "Scatch")
    --url <url>              foundry page where the font is loaded
    [--weight <number>]      font-weight to render (default: 400)
    [--heavy]                suffix output filename with _heavy
  `);
  process.exit(1);
}

// ── Output path (PRD §09 naming convention) ───────────────────────────────────

const suffix   = isHeavy ? '_heavy' : '';
const filename = `${foundry}_${typeface}_specimen${suffix}.jpg`;
const outDir   = path.join(process.cwd(), 'specimens');
const outPath  = path.join(outDir, filename);

// ── Main ──────────────────────────────────────────────────────────────────────

async function captureSpecimen() {
  console.log(`\nTypeScout specimen capture`);
  console.log(`  Typeface : ${fontFamily} (weight ${weight})`);
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
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Ensure all web fonts have finished loading
  await page.evaluate(() => document.fonts.ready);

  // Give late-loading fonts an extra moment
  await page.waitForTimeout(800);

  // ── Inject specimen overlay and measure exact text bounds ──────────────────
  const clip = await page.evaluate(
    ({ fontFamily, weight, label }) => {
      // Remove any leftover overlay from a previous run
      document.getElementById('__ts_specimen__')?.remove();

      const FONT_SIZE = 120; // px — large enough for quality, small enough to fit
      const PADDING   = 28;  // px — consistent whitespace around the glyph bounds

      // Measure text precisely using the Canvas 2D API
      const canvas = document.createElement('canvas');
      const ctx    = canvas.getContext('2d');
      ctx.font     = `${weight} ${FONT_SIZE}px "${fontFamily}"`;
      const m      = ctx.measureText(label);

      const textW   = Math.ceil(m.width);
      const ascent  = Math.ceil(m.fontBoundingBoxAscent  ?? FONT_SIZE * 0.80);
      const descent = Math.ceil(m.fontBoundingBoxDescent ?? FONT_SIZE * 0.20);
      const textH   = ascent + descent;

      const totalW = textW + PADDING * 2;
      const totalH = textH + PADDING * 2;

      // Build the overlay — fixed position, top-left, above everything
      const overlay = document.createElement('div');
      overlay.id = '__ts_specimen__';
      Object.assign(overlay.style, {
        position:   'fixed',
        top:        '0',
        left:       '0',
        width:      `${totalW}px`,
        height:     `${totalH}px`,
        background: '#ffffff',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:     '2147483647',
        overflow:   'hidden',
      });

      const text = document.createElement('span');
      text.textContent = label;
      Object.assign(text.style, {
        fontFamily:  `"${fontFamily}", serif`,
        fontSize:    `${FONT_SIZE}px`,
        fontWeight:  String(weight),
        color:       '#000000',
        lineHeight:  '1',
        whiteSpace:  'nowrap',
        display:     'block',
        userSelect:  'none',
      });

      overlay.appendChild(text);
      document.body.appendChild(overlay);

      return { x: 0, y: 0, width: totalW, height: totalH };
    },
    { fontFamily, weight, label: displayText ?? fontFamily }
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

  console.log(`Next: upload to Sanity as the specimenImage field on the "${fontFamily}" record.\n`);
}

captureSpecimen().catch((err) => {
  console.error(`\n✗ Error: ${err.message}\n`);
  process.exit(1);
});
