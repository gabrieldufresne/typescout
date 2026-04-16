/**
 * intake-data.js
 *
 * The ONLY file you edit for each new intake.
 * push-to-sanity.js imports from here — do not edit that file.
 *
 * Before editing: run `npm run check -- --foundry <slug> --typeface <slug>`
 */

// ── Foundry ───────────────────────────────────────────────────────────────────
// Existing foundry — use _id only:
const FOUNDRY = null;
const FOUNDRY_ID = 'foundry-tigh-type';

// ── Shared fields (common to all typefaces in this intake) ────────────────────
const SHARED = {
  weightRange:         ['light', 'regular', 'medium', 'bold', 'black'],
  era:                 ['Contemporary'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: true,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-plaid',
    name:              'Plaid',
    slug:              'plaid',
    specimenFile:      'tigh-type_plaid_specimen.jpg',
    specimenHeavyFile: 'tigh-type_plaid_specimen_heavy.jpg',
    editorialNote:     'Plaid compresses two typographic axes — weight and width — into a single named spectrum: XS reads light and condensed, XL reads bold and extended, and each step between occupies a distinct visual footprint. Issued in five proportional instances with italics and a parallel mono cut, it covers Latin and Cyrillic and is built for contexts where a single family needs to carry very different tonal registers.',
    classification:    ['sans-serif'],
    subClassification: 'Multi-Axis Geometric Sans',
    personalityTags:   ['Minimal', 'Functional', 'Neutral', 'Expressive', 'Serious'],
    useCaseTags:       ['Headline', 'Body Text', 'Editorial', 'Branding', 'Digital UI'],
    width:             'normal',
    xHeight:           'tall',
    contrast:          ['monolinear'],
    typefaceURL:       'https://tightype.com/typefaces/plaid/',
    rawKeywords:       ['XS S M L XL', 'weight and width axes', 'condensed to extended', 'Cyrillic', 'multi-axis', 'geometric sans', 'TIGHTYPE'],
  },
  {
    _id:               'typeface-plaid-mono',
    name:              'Plaid Mono',
    slug:              'plaid-mono',
    specimenFile:      'tigh-type_plaid-mono_specimen.jpg',
    specimenHeavyFile: 'tigh-type_plaid-mono_specimen_heavy.jpg',
    editorialNote:     'Plaid Mono carries the same weight-and-width spectrum as Plaid into fixed-width territory — five instances from narrow-light XS to broad-bold XL — optimized for code, tabular data, or any setting where character-width consistency is essential. Latin and Cyrillic support included.',
    classification:    ['sans-serif', 'monospace'],
    subClassification: 'Multi-Axis Monospace',
    personalityTags:   ['Minimal', 'Functional', 'Neutral', 'Serious'],
    useCaseTags:       ['Digital UI', 'Body Text', 'Editorial', 'Captions', 'Headline'],
    width:             'normal',
    xHeight:           'tall',
    contrast:          ['monolinear'],
    typefaceURL:       'https://tightype.com/typefaces/plaid/',
    rawKeywords:       ['XS S M L XL', 'fixed-width', 'monospaced', 'weight and width axes', 'Cyrillic', 'multi-axis', 'code', 'tabular', 'TIGHTYPE'],
  },
];

module.exports = { FOUNDRY, FOUNDRY_ID, SHARED, TYPEFACES };
