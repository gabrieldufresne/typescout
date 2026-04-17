/**
 * intake-data.js
 *
 * The ONLY file you edit for each new intake.
 * push-to-sanity.js imports from here — do not edit that file.
 *
 * Before editing: run `npm run check -- --foundry <slug> --typeface <slug>`
 */

// ── Foundry ───────────────────────────────────────────────────────────────────
// Existing foundry
const FOUNDRY = null;
const FOUNDRY_ID = 'foundry-typeverything';

// ── Shared fields (common to all typefaces in this intake) ────────────────────
const SHARED = {
  weightRange:         ['light'],
  width:               'normal',
  era:                 ['Contemporary'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: false,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-kitsune',
    name:              'Kitsune',
    slug:              'kitsune',
    specimenFile:      'typeverything_kitsune_specimen.jpg',
    editorialNote:     'Kitsuné, the Japanese word for fox, is a modern script display typeface packed with OpenType alternates and graphic glyphs. The subtle and well considered geometric shoulders and beautifully flowing capital forms are bound to impress, well suited for fashion magazines, wedding invitations and more. Designed by Andrei Robu.',
    classification:    ['script', 'display'],
    subClassification: 'Geometric Script',
    personalityTags:   ['Elegant', 'Sophisticated', 'Expressive', 'Refined'],
    useCaseTags:       ['Branding', 'Editorial', 'Packaging', 'Poster'],
    xHeight:           'medium',
    contrast:          ['monolinear'],
    typefaceURL:       'https://typeverything.com/kitsune',
    hasItalics:        false,
    rawKeywords:       ['Typeverything', 'Type Everything', 'Andrei Robu', 'Kitsuné', 'fox', 'Japanese', 'script display', 'wedding', 'fashion', 'OpenType alternates', 'ligatures', 'graphic glyphs'],
  },
];

module.exports = { FOUNDRY, FOUNDRY_ID, SHARED, TYPEFACES };
