// ── Foundry ───────────────────────────────────────────────────────────────────
const FOUNDRY_ID = 'foundry-kometa-type';

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'black'],
  width:               'normal',
  era:                 ['Contemporary', 'Swiss'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        true,
  hasItalics:          true,
  multilingualSupport: true,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-uniforma',
    name:              'Uniforma',
    slug:              'uniforma',
    specimenFile:      'kometa-type_uniforma_specimen.jpg',
    specimenHeavyFile: 'kometa-type_uniforma_specimen_heavy.jpg',
    editorialNote:     'Uniforma is a contemporary sans-serif system that began as an extension of Attila and outgrew its parent — fiercely familiar, innately original. Developed over seventeen months, it asserts a sovereign voice with its own internal logic, now expanded with distinctive Reverse Italics across eighteen styles. Designed by Christian Jánský for KOMETA, with 830 glyphs and 12 OpenType features.',
    classification:    ['sans-serif'],
    subClassification: 'Contemporary Grotesque',
    personalityTags:   ['Neutral', 'Functional', 'Minimal', 'Sophisticated'],
    useCaseTags:       ['Branding', 'Editorial', 'Body Text', 'Digital UI', 'Headline'],
    xHeight:           'tall',
    contrast:          ['low'],
    typefaceURL:       'https://kometatype.com/typefaces/uniforma',
    rawKeywords:       [
      'KOMETA', 'KOMETA Typefaces', 'Kometa Type', 'kometa-type',
      'Christian Jánský', 'Christian Jansky', 'Juan Jun Feng',
      'Brno', 'Czech Republic', 'Czechia',
      // distinctive features
      'reverse italic', 'reverse italics', 'ritalic', 'backslant', 'back-slant',
      'stylistic alternates', // OpenType — search engine matches verbatim
      // visual character
      'humanist sans', 'neo-grotesque', 'grotesque', 'contemporary sans',
      'modern sans', 'utility sans', 'workhorse sans', 'workhorse',
      'monolinear', 'open apertures', 'tall x-height',
      // weights / language
      'Hairline', 'Thin', 'Extralight', 'Black',
      '18 styles', '18 fonts', '9 weights', 'nine weights',
      'roman', 'italic', 'italics', 'variable font', 'VAR',
      'Latin', 'Latin Extended A', '41 languages', 'multilingual',
      '12 OpenType features', '830 glyphs',
      // version / history
      'Version 1.1', '2022 release', '2021 conceived',
      'Attila companion', 'Attila family', 'Uniform subfamily',
      // project-style keywords (from in-use imagery: graphic-design specimen book,
      // red cover, contemporary brand publication)
      'graphic design', 'design studio', 'design agency', 'creative studio',
      'brand identity', 'brand system', 'identity system', 'wordmark', 'logotype',
      'specimen book', 'design publication',
      'magazine', 'magazine design', 'editorial', 'editorial design',
      'annual report', 'corporate report', 'pitch deck', 'investor deck',
      'tech startup', 'startup', 'fintech', 'SaaS',
      'app UI', 'product UI', 'product design', 'web UI', 'dashboard',
      'app interface', 'mobile app',
      'fashion brand', 'luxury brand', 'cosmetics', 'beauty',
      'hospitality', 'restaurant menu', 'wine label',
      'wayfinding', 'signage', 'environmental graphics',
      'poster', 'gallery poster', 'art gallery',
      'small caps',
      'independent foundry', 'independent type',
    ],
  },
];

module.exports = { FOUNDRY_ID, SHARED, TYPEFACES };
