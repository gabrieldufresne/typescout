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
const FOUNDRY_ID = 'foundry-branding-with-type';

// ── Shared fields (common to all typefaces in this intake) ────────────────────
const SHARED = {
  weightRange:         ['thin', 'light', 'regular', 'medium', 'bold', 'extrabold'],
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
    _id:               'typeface-bw-pose-no-3',
    name:              'Bw Pose Nº 3',
    slug:              'bw-pose-no-3',
    specimenFile:      'branding-with-type_bw-pose-no-3_specimen.jpg',
    specimenHeavyFile: 'branding-with-type_bw-pose-no-3_specimen_heavy.jpg',
    editorialNote:     'Bw Pose Nº 3 is the more restrained of the two Pose subfamilies, a contemporary Didone by Alberto Romanos (2021) that pairs high-contrast strokes with traditional letterform proportions and subtly unexpected details. Six weights from Thin to ExtraBold with true italics make it adaptable across headline and editorial contexts. It leans into sophistication without sacrificing warmth.',
    classification:    ['serif', 'display'],
    subClassification: 'Contemporary Didone',
    personalityTags:   ['Elegant', 'Refined', 'Sophisticated', 'Warm', 'Approachable'],
    useCaseTags:       ['Branding', 'Editorial', 'Logo', 'Poster', 'Headline'],
    width:             'normal',
    xHeight:           'medium',
    contrast:          ['high'],
    typefaceURL:       'https://brandingwithtype.com/typefaces/bw-pose-no-3',
    hasItalics:        true,
    rawKeywords:       ['Branding with Type', 'BWT', 'Alberto Romanos', '2021', 'Bw Pose', 'Bw Pose Collection', 'Didone', 'modern serif', 'romantic', 'stylistic alternates', 'old style figures'],
  },
  {
    _id:               'typeface-bw-pose-no-5',
    name:              'Bw Pose Nº 5',
    slug:              'bw-pose-no-5',
    specimenFile:      'branding-with-type_bw-pose-no-5_specimen.jpg',
    specimenHeavyFile: 'branding-with-type_bw-pose-no-5_specimen_heavy.jpg',
    editorialNote:     'Bw Pose Nº 5 is the bolder sibling in the Pose collection — a high-contrast Didone by Alberto Romanos (2021) that pushes further into expressive territory with an extra layer of quirky detail in its letterforms. Six weights from Thin to ExtraBold with true italics give it range, while its daring character makes it well suited to fashion branding, editorial display, and headline work that wants an edge.',
    classification:    ['serif', 'display'],
    subClassification: 'Contemporary Didone',
    personalityTags:   ['Expressive', 'Elegant', 'Quirky', 'Sophisticated', 'Luxurious'],
    useCaseTags:       ['Branding', 'Editorial', 'Poster', 'Headline', 'Logo'],
    width:             'normal',
    xHeight:           'medium',
    contrast:          ['high'],
    typefaceURL:       'https://brandingwithtype.com/typefaces/bw-pose-no-5',
    hasItalics:        true,
    rawKeywords:       ['Branding with Type', 'BWT', 'Alberto Romanos', '2021', 'Bw Pose', 'Bw Pose Collection', 'Didone', 'modern serif', 'romantic', 'quirky', 'stylistic alternates', 'old style figures'],
  },
];

module.exports = { FOUNDRY, FOUNDRY_ID, SHARED, TYPEFACES };
