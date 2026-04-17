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
const FOUNDRY_ID = 'foundry-velvetyne';

// ── Shared fields (common to all typefaces in this intake) ────────────────────
const SHARED = {
  weightRange:         ['regular'],
  width:               'normal',
  era:                 ['Contemporary', 'Constructivist'],
  licensing:           'free',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: false,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:             'typeface-resistance',
    name:            'Résistance',
    slug:            'resistance',
    specimenFile:    'velvetyne_resistance_specimen.jpg',
    editorialNote:   'Résistance Générale is a curveless geometric sans-serif created in 2015 during a type design workshop at La Générale in Paris, by a collective of nine students from ENSAD Paris with support from Velvetyne. Every curve has been reduced to straight lines and right angles, giving the typeface a hard-edged, constructivist character that sits between functional display type and graphic protest. Its name — evoking both the French Resistance and the physics concept of electrical resistance — frames the design as a deliberate act of opposition.',
    classification:  ['sans-serif', 'display'],
    subClassification: 'Geometric Sans',
    personalityTags: ['Experimental', 'Raw', 'Authoritative', 'Minimal', 'Serious'],
    useCaseTags:     ['Poster', 'Headline', 'Branding', 'Editorial', 'Short Copy'],
    xHeight:         'medium',
    contrast:        ['monolinear'],
    typefaceURL:     'https://velvetyne.fr/fonts/resistance/',
    hasItalics:      false,
    rawKeywords:     ['Velvetyne', 'ENSAD Paris', 'La Générale', 'collective', '2015', 'curveless', 'brutalist', 'geometric', 'right angles', 'no curves', 'student workshop', 'open source', 'OFL', 'Pauline Cormault', 'Esther Michaud', 'Claire Mucchieli', 'Merlin Andreae', 'Raphaël Maman', 'Pedro Gomes-Cardoso', 'Juliette Nier', 'Gabrielle Meistretty', 'Damien Bauza', 'Résistance Générale', 'Resistance Generale'],
  },
];

module.exports = { FOUNDRY, FOUNDRY_ID, SHARED, TYPEFACES };
