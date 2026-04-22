// ── Foundry ───────────────────────────────────────────────────────────────────
// SM foundry already exists in Sanity — reference by ID only
const FOUNDRY_ID = 'foundry-s-m';

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ['regular'],
  width:               'normal',
  era:                 ['Contemporary', 'Modernist'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  multilingualSupport: false,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:            'typeface-stellage',
    name:           'Stellage',
    slug:           'stellage',
    specimenFile:   's-m_stellage_specimen.jpg',
    editorialNote:  'Stellage is a versatile geometric serif with square and triangular serifs, each character imagined as a little building where modern and classical shapes meet. Inspired by postmodern architecture and design, it offers sharp legibility at text sizes while revealing rich structural detail at display scale.',
    classification:    ['serif'],
    subClassification: 'Geometric Serif',
    personalityTags:   ['Refined', 'Elegant', 'Sophisticated', 'Warm', 'Approachable'],
    useCaseTags:       ['Branding', 'Editorial', 'Body Text', 'Headline', 'Logo'],
    xHeight:           'medium',
    contrast:          ['medium'],
    typefaceURL:       'https://s-m.nu/typefaces/stellage',
    rawKeywords:       ['SM', 'Soft Machine', 's-m.nu', 'Mark Niemeijer', 'geometric serif', 'square serifs', 'triangular serifs', 'postmodern', 'architecture', '2020', 'Apeldoorn', 'Netherlands'],
    hasItalics:        true,
  },
  {
    _id:            'typeface-stellage-display',
    name:           'Stellage Display',
    slug:           'stellage-display',
    specimenFile:   's-m_stellage-display_specimen.jpg',
    editorialNote:  'Stellage Display is the large-size cut of the geometric serif family, amplifying the architectural details — square serifs and angular intersections — that give each character its structural character.',
    classification:    ['serif', 'display'],
    subClassification: 'Geometric Serif',
    personalityTags:   ['Elegant', 'Sophisticated', 'Refined', 'Expressive', 'Luxurious'],
    useCaseTags:       ['Headline', 'Poster', 'Branding', 'Editorial', 'Logo'],
    xHeight:           'medium',
    contrast:          ['medium'],
    typefaceURL:       'https://s-m.nu/typefaces/stellage',
    rawKeywords:       ['SM', 'Soft Machine', 's-m.nu', 'Mark Niemeijer', 'geometric serif', 'display', 'postmodern', 'architecture', '2020', 'Apeldoorn', 'Netherlands'],
    hasItalics:        false,
  },
  {
    _id:            'typeface-stellage-constructed',
    name:           'Stellage Constructed',
    slug:           'stellage-constructed',
    specimenFile:   's-m_stellage-constructed_specimen.jpg',
    editorialNote:  'Stellage Constructed is a structural alternate within the geometric serif family, reducing each letterform to its architectural skeleton and amplifying the angular, building-like quality of the design.',
    classification:    ['serif'],
    subClassification: 'Geometric Serif',
    personalityTags:   ['Technical', 'Experimental', 'Minimal', 'Refined', 'Authoritative'],
    useCaseTags:       ['Branding', 'Headline', 'Poster', 'Signage', 'Logo'],
    xHeight:           'medium',
    contrast:          ['low'],
    typefaceURL:       'https://s-m.nu/typefaces/stellage',
    rawKeywords:       ['SM', 'Soft Machine', 's-m.nu', 'Mark Niemeijer', 'geometric serif', 'constructed', 'postmodern', 'architecture', '2020', 'Apeldoorn', 'Netherlands'],
    hasItalics:        true,
  },
];

module.exports = { FOUNDRY_ID, SHARED, TYPEFACES };
