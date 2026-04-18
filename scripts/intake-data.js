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
const FOUNDRY_ID = 'foundry-formerly-known';

// ── Shared fields (common to all typefaces in this intake) ────────────────────
const SHARED = {
  weightRange:         ['regular', 'medium', 'bold', 'extrabold'],
  width:               'normal',
  era:                 ['Contemporary', 'Heritage'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        true,
  multilingualSupport: true,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-echo',
    name:              'Echo',
    slug:              'echo',
    specimenFile:      'formerly-known_echo_specimen.jpg',
    specimenHeavyFile: 'formerly-known_echo_specimen_heavy.jpg',
    editorialNote:     'Echo is a contemporary Old Style serif in 4 upright weights across 4 widths, where softened details give the family an approachable, familiar feel. Quirky, slouchy shaping and terminal overreach are unexpected for an Old Style; its reflected O and o, activatable through OpenType features, add a disruptive visual impact.',
    classification:    ['serif'],
    subClassification: 'Old Style Serif',
    personalityTags:   ['Approachable', 'Warm', 'Quirky', 'Expressive', 'Experimental'],
    useCaseTags:       ['Editorial', 'Body Text', 'Headline', 'Branding', 'Longform Reading'],
    xHeight:           'medium',
    contrast:          ['medium'],
    typefaceURL:       'https://formerly-known.com/typeface/echo',
    hasItalics:        false,
    rawKeywords:       ['Formerly Known', 'FKT', 'Formerly Known Type', 'Hambly Freeman', '2024', 'Old Style', 'Echoplex', 'tape delay', 'variable font', 'reflected O', 'condensed', 'four widths'],
  },
];

module.exports = { FOUNDRY, FOUNDRY_ID, SHARED, TYPEFACES };
