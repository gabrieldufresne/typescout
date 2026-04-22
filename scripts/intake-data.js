// ── Foundry ───────────────────────────────────────────────────────────────────
// Schick Toikka already exists in Sanity — reference by ID only
const FOUNDRY_ID = 'foundry-schick-toikka';

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ['light', 'regular', 'medium', 'bold', 'black'],
  width:               'normal',
  era:                 ['Contemporary', 'Modernist'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  hasItalics:          true,
  multilingualSupport: false,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-lyyra-standard',
    name:              'Lyyra Standard',
    slug:              'lyyra-standard',
    specimenFile:      'schick-toikka_lyyra-standard_specimen.jpg',
    specimenHeavyFile: 'schick-toikka_lyyra-standard_specimen_heavy.jpg',
    editorialNote:     'Lyyra is a typeface with a radical aesthetic that alternates between the organic and the mechanical — bowls grow from a point into acute symmetrical petals, while stroke endings cut vertically give it an air of immediacy, recalling Johnston\'s Railway Type and Excoffon\'s Antique Olive. Available across three widths and five weights, it is a self-confident face suited to editorial design, identity work, and monumental display.',
    classification:    ['sans-serif', 'display'],
    subClassification: 'Organic Grotesque',
    personalityTags:   ['Expressive', 'Authoritative', 'Experimental', 'Raw', 'Sophisticated'],
    useCaseTags:       ['Editorial', 'Branding', 'Headline', 'Logo', 'Poster'],
    xHeight:           'tall',
    contrast:          ['low'],
    typefaceURL:       'https://www.schick-toikka.com/lyyra',
    rawKeywords:       ['Schick Toikka', 'ST', 'Lyyra', 'Johnston Railway Type', 'Antique Olive', 'Excoffon', 'German grotesk', 'organic grotesque', 'diagonal', 'petals', 'counters', 'diamond dots', 'modulated strokes', 'Helsinki', 'Finnish'],
  },
  {
    _id:               'typeface-lyyra-extended',
    name:              'Lyyra Extended',
    slug:              'lyyra-extended',
    specimenFile:      'schick-toikka_lyyra-extended_specimen.jpg',
    specimenHeavyFile: 'schick-toikka_lyyra-extended_specimen_heavy.jpg',
    editorialNote:     'Lyyra is a typeface with a radical aesthetic that alternates between the organic and the mechanical — bowls grow from a point into acute symmetrical petals, while stroke endings cut vertically give it an air of immediacy, recalling Johnston\'s Railway Type and Excoffon\'s Antique Olive. Available across three widths and five weights, it is a self-confident face suited to editorial design, identity work, and monumental display.',
    classification:    ['sans-serif', 'display'],
    subClassification: 'Organic Grotesque',
    personalityTags:   ['Expressive', 'Authoritative', 'Experimental', 'Raw', 'Sophisticated'],
    useCaseTags:       ['Editorial', 'Branding', 'Headline', 'Poster', 'Logo'],
    xHeight:           'tall',
    contrast:          ['low'],
    width:             'wide',
    typefaceURL:       'https://www.schick-toikka.com/lyyra',
    rawKeywords:       ['Schick Toikka', 'ST', 'Lyyra', 'Johnston Railway Type', 'Antique Olive', 'Excoffon', 'German grotesk', 'organic grotesque', 'diagonal', 'petals', 'counters', 'diamond dots', 'modulated strokes', 'Helsinki', 'Finnish'],
  },
  {
    _id:               'typeface-lyyra-expanded',
    name:              'Lyyra Expanded',
    slug:              'lyyra-expanded',
    specimenFile:      'schick-toikka_lyyra-expanded_specimen.jpg',
    specimenHeavyFile: 'schick-toikka_lyyra-expanded_specimen_heavy.jpg',
    editorialNote:     'Lyyra is a typeface with a radical aesthetic that alternates between the organic and the mechanical — bowls grow from a point into acute symmetrical petals, while stroke endings cut vertically give it an air of immediacy, recalling Johnston\'s Railway Type and Excoffon\'s Antique Olive. Available across three widths and five weights, it is a self-confident face suited to editorial design, identity work, and monumental display.',
    classification:    ['sans-serif', 'display'],
    subClassification: 'Organic Grotesque',
    personalityTags:   ['Expressive', 'Authoritative', 'Experimental', 'Raw', 'Sophisticated'],
    useCaseTags:       ['Poster', 'Editorial', 'Headline', 'Branding', 'Logo'],
    xHeight:           'tall',
    contrast:          ['low'],
    width:             'extended',
    typefaceURL:       'https://www.schick-toikka.com/lyyra',
    rawKeywords:       ['Schick Toikka', 'ST', 'Lyyra', 'Johnston Railway Type', 'Antique Olive', 'Excoffon', 'German grotesk', 'organic grotesque', 'diagonal', 'petals', 'counters', 'diamond dots', 'modulated strokes', 'Helsinki', 'Finnish'],
  },
];

module.exports = { FOUNDRY_ID, SHARED, TYPEFACES };
