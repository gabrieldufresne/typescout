// ── Foundry ───────────────────────────────────────────────────────────────────
const FOUNDRY = {
  _id:         'foundry-off-type',
  _type:       'foundry',
  name:        'Off Type',
  slug:        { _type: 'slug', current: 'off-type' },
  location:    '',
  website:     'https://off-type.com',
  foundryType: 'independent',
  description: 'Off Type offers beautifully off-beat fonts free for personal use, with commercial licenses available for purchase. Their typefaces draw from an eclectic mix of inspirations — royalty, rockets, the silver screen, b-sides — built to be rigorously well-made and unusual. Collaborators include designers Mathieu Desjardins and Valerio Monopoli.',
};

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ['regular'],
  width:               'normal',
  era:                 ['Contemporary'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: false,
  hasItalics:          true,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:            'typeface-ot-brut',
    name:           'OT Brut',
    slug:           'ot-brut',
    specimenFile:   'off-type_ot-brut_specimen.jpg',
    editorialNote:  'Flipping the genre-defining neoclassical classic on its head, OT Brut reimagines the traditional drops of Bodoni as something more brutalist and angular — a curveless, characterful, constructed design suited for contexts beyond the runway. Packed with discretionary ligatures and tools for interlocking typographic compositions.',
    classification: ['serif', 'display'],
    subClassification: 'Brutalist Serif',
    personalityTags:   ['Raw', 'Expressive', 'Authoritative', 'Experimental'],
    useCaseTags:       ['Headline', 'Poster', 'Branding', 'Editorial'],
    era:               ['Contemporary', 'Modernist'],
    xHeight:           'medium',
    contrast:          ['high'],
    typefaceURL:       'https://off-type.com/products/brut',
    rawKeywords:       ['Off Type', 'OT', 'Valerio Monopoli', 'Sergio Lairisa', 'Studio Ground Floor', 'Bodoni', 'brutalist', 'angular', 'high contrast', 'discretionary ligatures', 'curveless', 'serif'],
  },
  {
    _id:            'typeface-ot-brut-mono',
    name:           'OT Brut Mono',
    slug:           'ot-brut-mono',
    specimenFile:   'off-type_ot-brut-mono_specimen.jpg',
    editorialNote:  'The monospaced companion to OT Brut, applying the same curveless brutalist reinterpretation of Bodoni to a fixed-width grid — complete with coding abbreviations and discretionary ligatures built in.',
    classification: ['serif', 'monospace', 'display'],
    subClassification: 'Brutalist Monospace',
    personalityTags:   ['Raw', 'Experimental', 'Functional', 'Expressive'],
    useCaseTags:       ['Headline', 'Poster', 'Digital UI', 'Editorial'],
    era:               ['Contemporary'],
    xHeight:           'medium',
    contrast:          ['high'],
    typefaceURL:       'https://off-type.com/products/brut',
    rawKeywords:       ['Off Type', 'OT', 'Valerio Monopoli', 'brutalist', 'angular', 'monospace', 'mono', 'coding', 'high contrast', 'discretionary ligatures', 'curveless'],
  },
];

module.exports = { FOUNDRY, SHARED, TYPEFACES };
