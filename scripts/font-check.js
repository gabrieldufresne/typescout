/**
 * font-check.js
 *
 * Pre-flight font accessibility probe for TypeScout intake.
 * Run this before starting a full intake to determine how fonts are loaded
 * on a foundry's page — and get a ready-to-paste specimen command when possible.
 *
 * Verdicts:
 *   EASY       — fonts in document.fonts with readable names. Command generated.
 *   OBFUSCATED — family names randomized per page load (Type of Feeling pattern).
 *                Use --font-url against the readable woff URL instead.
 *   MEDIUM     — fonts loaded but names need selection (UUID or per-weight families).
 *   HARD       — fonts lazy-loaded. Expect Tier 3 UUID resolution.
 *   BLOCKED    — no fonts found. May require login, purchase, or third-party CDN.
 *
 * Usage:
 *   npm run font-check -- --url <url> [--foundry <slug>] [--typeface <slug>]
 *
 * Examples:
 *   npm run font-check -- --url https://nuformtype.com/hermanos
 *   npm run font-check -- --url https://grillitype.com/typeface/gt-america --foundry grilli-type --typeface gt-america
 */

'use strict';

const { chromium } = require('playwright');

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const url      = getArg('--url');
const foundry  = getArg('--foundry');
const typeface = getArg('--typeface');

if (!url) {
  console.error(`
Usage:
  npm run font-check -- --url <url> [--foundry <slug>] [--typeface <slug>]

  --url       Required. Foundry page URL to probe.
  --foundry   Optional. Foundry slug — included in suggested specimen command.
  --typeface  Optional. Typeface slug — used to guess display text and fill command.

Examples:
  npm run font-check -- --url https://nuformtype.com/hermanos
  npm run font-check -- --url https://grillitype.com/typeface/gt-america --foundry grilli-type --typeface gt-america
  `);
  process.exit(1);
}

// ── Constants ─────────────────────────────────────────────────────────────────

// System and UI fonts that are never typeface candidates
const SYSTEM_FONTS = new Set([
  'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
  'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'system-ui',
  '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif',
  'serif', 'monospace', 'cursive', 'fantasy', 'inherit', 'initial',
  // Common foundry UI fonts — skip these
  'Geist', 'Inter', 'Lilex', 'Söhne', 'ABC Diatype', 'Neue Haas Grotesk',
  'Suisse Int\'l', 'Graphik', 'GT Pressura',
]);

// Weight suffixes used when stripping to derive display text from family name
const WEIGHT_SUFFIXES_RE = new RegExp(
  '[-\\s]?(Thin|Hairline|ExtraLight|Extra Light|UltraLight|Ultra Light|Light|' +
  'Book|Regular|Roman|Normal|Medium|SemiBold|Semi Bold|DemiBold|Demi Bold|Bold|' +
  'ExtraBold|Extra Bold|UltraBold|Ultra Bold|Black|Heavy|Ultra|Italic|Oblique)$',
  'i'
);

// Detects UUID-style family names (Schick Toikka pattern and similar)
const UUID_PATTERN = /^[a-z0-9]{16,}$/i;
const UUID_DASH_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-/;

// Detects obfuscated/randomized family names (Type of Feeling pattern):
// - F_1777383467_19  (prefix + digits + _ + digits)
// - ES-2091256597405 (short prefix + 8+ digits)
// These IDs change on every page load, so capturing via --font-family is
// unreliable — use --font-url against the stable woff/woff2 URL instead.
const OBFUSCATED_PATTERNS = [
  /^[A-Za-z]{1,3}[-_]\d{6,}(_\d+)?$/,   // F_1777383467_19, ES-2091256597405
  /^[A-Za-z]+_\d{4,}_\d{1,4}$/,         // Anything_1234567_19
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSystemFont(name) {
  const clean = name.replace(/['"]/g, '').trim();
  return SYSTEM_FONTS.has(clean);
}

function isUUID(name) {
  const clean = name.replace(/['"]/g, '').trim();
  return UUID_PATTERN.test(clean) || UUID_DASH_PATTERN.test(clean);
}

function isObfuscated(name) {
  const clean = name.replace(/['"]/g, '').trim();
  return OBFUSCATED_PATTERNS.some(p => p.test(clean));
}

// Pick the best Regular-weight candidate from a list of network font URLs.
// Looks for "regular", "roman", "book", "400", or fallback to first.
function findRegularUrl(urls) {
  return (
    urls.find(u => /-regular\.|_regular\.|\bregular\./i.test(u)) ||
    urls.find(u => /-roman\.|-book\./i.test(u)) ||
    urls.find(u => /-400\.|_400\./.test(u)) ||
    urls.find(u => !/-(thin|light|medium|semibold|demi|bold|extrabold|black|heavy|italic)/i.test(u)) ||
    urls[0] ||
    null
  );
}

function findHeavyUrl(urls) {
  return (
    urls.find(u => /-black\.|_black\./i.test(u)) ||
    urls.find(u => /-heavy\.|-ultra\./i.test(u)) ||
    urls.find(u => /-extrabold\./i.test(u)) ||
    urls.find(u => /-bold\.|_bold\./i.test(u)) ||
    null
  );
}

// Filter network font URLs to those whose filenames look like the typeface
// (readable, not Google Fonts / theme UI fonts / system fonts). When the
// typeface slug appears in any URL, narrow to only those — otherwise return
// all readable typeface candidates so the operator can pick.
function filterTypefaceFontUrls(networkFonts, typefaceSlug) {
  const readable = networkFonts.filter(u => {
    if (/googleapis|gstatic/i.test(u)) return false;
    if (!/\.(woff2?|ttf|otf)($|\?)/i.test(u)) return false;
    const filename = u.split('/').pop().toLowerCase();
    if (/^(ibm|inter|geist|söhne|sohne|graphik|plex|space-grotesk|jetbrains)/i.test(filename)) return false;
    return /[a-z]{4,}/i.test(filename) && !/^[a-f0-9]{16,}/i.test(filename);
  });

  if (typefaceSlug) {
    const slug = typefaceSlug.toLowerCase();
    const slugMatched = readable.filter(u => u.toLowerCase().includes(slug));
    if (slugMatched.length > 0) return slugMatched;
  }

  return readable;
}

function stripWeightSuffix(name) {
  return name.replace(/['"]/g, '').trim().replace(WEIGHT_SUFFIXES_RE, '').trim();
}

// Pick the best Regular-weight candidate from a font list
function findRegular(fonts) {
  return (
    fonts.find(f => /regular/i.test(f.family)) ||
    fonts.find(f => /roman|book/i.test(f.family)) ||
    fonts.find(f => f.weight === '400' || f.weight === 'normal') ||
    fonts[0] ||
    null
  );
}

// Pick the best Heavy-weight candidate from a font list
function findHeavy(fonts) {
  return (
    fonts.find(f => /black/i.test(f.family)) ||
    fonts.find(f => /heavy|ultra/i.test(f.family)) ||
    fonts.find(f => /extrabold|extra.?bold/i.test(f.family)) ||
    fonts.find(f => f.weight === '900') ||
    fonts.find(f => f.weight === '800') ||
    null
  );
}

// Guess the display --text value from the family name or typeface slug
function guessDisplayText(familyName) {
  if (typeface) {
    // Convert slug to Title Case: "gt-america" → "GT America"
    return typeface
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return stripWeightSuffix(familyName.replace(/['"]/g, '').trim());
}

// Build the ready-to-paste npm run specimen command
function buildCommand(font, displayText, isHeavy) {
  const family = font.family.replace(/['"]/g, '').trim();
  const lines = ['npm run specimen --'];
  if (foundry)  lines.push(`  --foundry ${foundry}`);
  if (typeface) lines.push(`  --typeface ${typeface}`);
  lines.push(`  --font-family "${family}"`);
  // Only include --text when it differs from the family name
  if (displayText && displayText !== family) {
    lines.push(`  --text "${displayText}"`);
  }
  lines.push(`  --url ${url}`);
  if (isHeavy) lines.push('  --heavy');
  return lines.join(' \\\n');
}

// Build a --font-url command for OBFUSCATED verdicts
function buildFontUrlCommand(fontFileUrl, displayText, isHeavy) {
  const lines = ['npm run specimen --'];
  if (foundry)  lines.push(`  --foundry ${foundry}`);
  if (typeface) lines.push(`  --typeface ${typeface}`);
  lines.push(`  --font-url ${fontFileUrl}`);
  if (displayText) lines.push(`  --text "${displayText}"`);
  lines.push(`  --url ${url}`);
  if (isHeavy) lines.push('  --heavy');
  return lines.join(' \\\n');
}

const LINE = '─'.repeat(62);

// ── Main ──────────────────────────────────────────────────────────────────────

async function checkFonts() {
  console.log(`\nTypeScout — Font Pre-flight Check`);
  console.log(`  ${url}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1800, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  console.log('→ Loading page…');
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } catch (err) {
    // networkidle can time out on some SPAs — proceed with what loaded
    if (!err.message.includes('timeout')) throw err;
  }

  // Wait for fonts and give late-loaders a moment
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  // ── Collect font data from the page ─────────────────────────────────────
  const report = await page.evaluate(() => {
    // 1. document.fonts — eagerly and demand-loaded fonts
    const loaded = [...document.fonts].map(f => ({
      family: (f.family || '').replace(/['"]/g, '').trim(),
      weight: f.weight,
      status: f.status,
    }));

    // 2. CSS @font-face rules — registered even for lazy-loaded fonts
    const faceRules = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules); } catch { return []; }
    })
    .filter(r => r.constructor && r.constructor.name === 'CSSFontFaceRule')
    .map(r => ({
      family: (r.style.fontFamily || '').replace(/['"]/g, '').trim(),
      weight: r.style.fontWeight || 'normal',
    }));

    // 3. Network font requests — woff/woff2/otf, /api/fonts/, /fonts/ paths
    const networkFonts = Array.from(performance.getEntriesByType('resource'))
      .filter(r =>
        /\.(woff2?|ttf|otf)($|\?)/.test(r.name) ||
        r.name.includes('/api/fonts') ||
        (r.name.includes('/fonts/') && !r.name.includes('googleapis'))
      )
      .map(r => r.name);

    return { loaded, faceRules, networkFonts };
  });

  await browser.close();

  // ── Classify fonts ────────────────────────────────────────────────────────

  // De-duplicate and remove system/UI fonts
  const seenFamilies = new Set();
  const customFonts = report.loaded.filter(f => {
    if (!f.family || isSystemFont(f.family)) return false;
    if (seenFamilies.has(f.family)) return false;
    seenFamilies.add(f.family);
    return true;
  });

  const obfuscatedFonts = customFonts.filter(f => isObfuscated(f.family));
  const uuidFonts       = customFonts.filter(f => !isObfuscated(f.family) && isUUID(f.family));
  const namedFonts      = customFonts.filter(f => !isObfuscated(f.family) && !isUUID(f.family));

  const customFaceRules = report.faceRules.filter(
    f => f.family && !isSystemFont(f.family) && !seenFamilies.has(f.family)
  );

  const hasNetworkFonts = report.networkFonts.length > 0;
  const hasFaceRules    = customFaceRules.length > 0;

  // Network font URLs that look like the typeface (filtered down from all woff/woff2 hits)
  const typefaceFontUrls = filterTypefaceFontUrls(report.networkFonts, typeface);

  // ── Determine verdict ─────────────────────────────────────────────────────

  let verdict, note;

  if (namedFonts.length > 0) {
    if (hasNetworkFonts || hasFaceRules || namedFonts.some(f => f.status === 'loaded')) {
      verdict = 'EASY ✓';
      note    = 'Fonts loaded via CSS with readable names. Specimen command ready below.';
    } else {
      verdict = 'MEDIUM ~';
      note    = 'Fonts detected — delivery method unclear. Pick the right family from the list below.';
    }
  } else if (obfuscatedFonts.length > 0 && typefaceFontUrls.length > 0) {
    verdict = 'OBFUSCATED ~';
    note    = 'Family names are randomized per page load — use --font-url against the readable woff URL.';
  } else if (uuidFonts.length > 0) {
    verdict = 'MEDIUM ~';
    note    = 'Fonts loaded under UUID family names (Schick Toikka pattern). Need DOM cross-reference to map to weight labels.';
  } else if (hasFaceRules || hasNetworkFonts) {
    verdict = 'HARD ✗';
    note    = 'Fonts registered but not loaded — lazy-loaded behind user interaction. Expect Tier 3 UUID work.';
  } else {
    verdict = 'BLOCKED ✗';
    note    = 'No fonts detected. May require login, purchase, or fonts are served from a third-party CDN.';
  }

  // ── Print results ─────────────────────────────────────────────────────────

  console.log(LINE);
  console.log(`VERDICT: ${verdict}`);
  console.log(note);
  console.log(LINE);

  // Named fonts
  if (namedFonts.length > 0) {
    console.log(`\nFonts in document.fonts (${namedFonts.length} custom):\n`);
    for (const f of namedFonts) {
      const errNote = f.status === 'error'
        ? '  ← "error" may still render via CSS demand-load — try it'
        : '';
      console.log(`  ${f.family.padEnd(38)}  wt:${f.weight.padEnd(6)}  ${f.status}${errNote}`);
    }
  }

  // Obfuscated fonts (randomized IDs)
  if (obfuscatedFonts.length > 0) {
    console.log(`\nObfuscated families (${obfuscatedFonts.length}) — IDs change per page load:\n`);
    for (const f of obfuscatedFonts) {
      console.log(`  ${f.family.padEnd(38)}  wt:${f.weight.padEnd(6)}  ${f.status}`);
    }
  }

  // UUID fonts
  if (uuidFonts.length > 0) {
    console.log(`\nUUID-style families (${uuidFonts.length}) — need DOM cross-reference:\n`);
    for (const f of uuidFonts) {
      console.log(`  ${f.family.padEnd(38)}  wt:${f.weight}`);
    }
  }

  // @font-face rules (unloaded — lazy-loaded fonts)
  if (hasFaceRules && customFonts.length === 0) {
    console.log(`\n@font-face rules found (not yet loaded — lazy-loaded, ${customFaceRules.length}):\n`);
    for (const f of customFaceRules.slice(0, 12)) {
      console.log(`  ${f.family.padEnd(38)}  wt:${f.weight}`);
    }
    if (customFaceRules.length > 12) {
      console.log(`  … and ${customFaceRules.length - 12} more`);
    }
  }

  // Network font requests
  if (hasNetworkFonts) {
    console.log(`\nNetwork font requests (${report.networkFonts.length}):\n`);
    for (const n of report.networkFonts.slice(0, 6)) {
      const short = n.length > 68 ? '…' + n.slice(-65) : n;
      console.log(`  ${short}`);
    }
    if (report.networkFonts.length > 6) {
      console.log(`  … and ${report.networkFonts.length - 6} more`);
    }
  }

  // ── Suggested commands ────────────────────────────────────────────────────

  // OBFUSCATED — emit --font-url suggestion using readable woff filename
  if (verdict.startsWith('OBFUSCATED') && typefaceFontUrls.length > 0) {
    const regularUrl = findRegularUrl(typefaceFontUrls);
    const heavyUrl   = findHeavyUrl(typefaceFontUrls.filter(u => u !== regularUrl));
    const displayText = typeface
      ? typeface.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : null;

    console.log(`\n${LINE}`);
    console.log('Suggested commands (using --font-url to bypass randomized family names):\n');

    console.log('  Regular:');
    const regularCmd = buildFontUrlCommand(regularUrl, displayText, false);
    regularCmd.split('\n').forEach(l => console.log('  ' + l));

    if (heavyUrl) {
      console.log('\n  Heavy (only if Black/Bold looks meaningfully different at display size):');
      const heavyCmd = buildFontUrlCommand(heavyUrl, displayText, true);
      heavyCmd.split('\n').forEach(l => console.log('  ' + l));
    }

    if (!foundry || !typeface) {
      console.log('\n  ↑ Re-run with --foundry <slug> --typeface <slug> to fill in the slugs.');
    }
  }

  if (namedFonts.length > 0) {
    const regular     = findRegular(namedFonts);
    const heavy       = findHeavy(namedFonts.filter(f => f !== regular));
    const displayText = guessDisplayText(regular.family);

    console.log(`\n${LINE}`);
    console.log('Suggested commands:\n');

    console.log('  Regular:');
    const regularCmd = buildCommand(regular, displayText, false);
    regularCmd.split('\n').forEach(l => console.log('  ' + l));

    if (heavy) {
      console.log('\n  Heavy (only if Black looks meaningfully different at display size):');
      const heavyCmd = buildCommand(heavy, displayText, true);
      heavyCmd.split('\n').forEach(l => console.log('  ' + l));
    }

    if (!foundry || !typeface) {
      console.log('\n  ↑ Re-run with --foundry <slug> --typeface <slug> to fill in the slugs.');
    }
  }

  // ── Next steps for non-EASY verdicts ─────────────────────────────────────

  if (verdict.startsWith('MEDIUM') && uuidFonts.length > 0) {
    console.log(`\n${LINE}`);
    console.log('UUID resolution — run in a playwright-cli session:\n');
    console.log(`  playwright-cli -s=intake open ${url}`);
    console.log(`  playwright-cli -s=intake eval "Array.from(document.querySelectorAll('*')).filter(el => { var ff = window.getComputedStyle(el).fontFamily; return ff && el.children.length === 0 && el.textContent.trim().length > 3; }).slice(0,30).map(el => window.getComputedStyle(el).fontFamily.split(',')[0].trim() + ' | ' + el.textContent.trim().slice(0,40))"`);
    console.log('\n  This maps each UUID to the weight label text it renders next to.');
  }

  if (verdict.startsWith('HARD')) {
    console.log(`\n${LINE}`);
    console.log('Tier 3 next steps:\n');
    console.log(`  playwright-cli -s=intake open ${url}`);
    console.log(`  playwright-cli -s=intake eval "Array.from(document.styleSheets).flatMap(s => { try { return Array.from(s.cssRules) } catch(e) { return [] } }).filter(r => r.constructor.name === 'CSSFontFaceRule').map(r => r.style.fontFamily + ' w=' + r.style.fontWeight)"`);
    console.log('\n  Then cross-reference UUIDs with DOM text — see typeface-screenshot-tool.md Tier 3.');
  }

  if (verdict.startsWith('BLOCKED')) {
    console.log(`\n${LINE}`);
    console.log('Things to check:\n');
    console.log('  — Does this page require login or purchase before fonts load?');
    console.log('  — Try the foundry\'s main type-tester or specimen page instead.');
    console.log('  — Are fonts served via Adobe Fonts or Google Fonts? Check the network tab.');
    console.log('  — If fonts are genuinely inaccessible, skip this typeface for now.');
  }

  console.log(`\n${LINE}\n`);
}

checkFonts().catch(err => {
  console.error(`\n✗ Error: ${err.message}\n`);
  process.exit(1);
});
