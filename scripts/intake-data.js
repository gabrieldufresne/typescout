// ── Foundry ───────────────────────────────────────────────────────────────────
const FOUNDRY = {
  _type:       'foundry',
  _id:         'foundry-heavyweight-type',
  name:        'Heavyweight',
  slug:        { _type: 'slug', current: 'heavyweight-type' },
  location:    'Prague, Czech Republic',
  website:     'https://heavyweight-type.com',
  foundryType: 'independent',
  description: 'Heavyweight is an independent design studio established by Filip Matejicek and Jan Horcik in Prague, specialising in typeface design. The foundry emphasises simplicity, precision of detail, and tasteful design while maintaining respect for the discipline and its history. Their fonts are used globally by major institutions including The New York Times, Walker Art Center, and Whitney Museum, as well as independent publishers and startups.',
};

// ── Shared fields ─────────────────────────────────────────────────────────────
const SHARED = {
  weightRange:         ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
  width:               'normal',
  era:                 ['Heritage', 'Vintage'],
  licensing:           'paid',
  platforms:           'neither',
  variableFont:        false,
  hasItalics:          false,
  multilingualSupport: true,
  featured:            false,
};

// ── Typefaces ─────────────────────────────────────────────────────────────────
const TYPEFACES = [
  {
    _id:               'typeface-cigars',
    name:              'Cigars',
    slug:              'cigars',
    specimenFile:      'heavyweight-type_cigars_specimen.jpg',
    specimenHeavyFile: 'heavyweight-type_cigars_specimen_heavy.jpg',
    editorialNote:     'Named for Heavyweight\'s admiration of vintage Marlboro advertising — which leaned on Century by American Type Founders — Cigars is a calligraphic serif that wears its influence quietly. The calligraphic hand is only visible in the details: letters like \'c\', \'f\', and \'r\' close with a perpendicular cut rather than a classic terminal, lending the face a refined idiosyncrasy across nine weights from SuperSlim to Strong.',
    classification:    ['serif', 'display'],
    subClassification: 'Calligraphic Serif',
    personalityTags:   ['Sophisticated', 'Elegant', 'Refined', 'Expressive', 'Quirky'],
    useCaseTags:       ['Headline', 'Editorial', 'Branding', 'Poster', 'Logo'],
    xHeight:           'medium',
    contrast:          ['high'],
    typefaceURL:       'https://heavyweight-type.com/fonts/cigars/detail',
    rawKeywords:       [
      'Heavyweight', 'heavyweight-type',
      'Filip Matejicek', 'Jan Horcik',
      'Prague', 'Czech Republic',
      'Century', 'American Type Founders', 'Marlboro',
      'SuperSlim', 'Slim', 'Strong',
      'calligraphic', 'perpendicular cut terminals',
      '219 languages',
      'small caps', 'old-style figures', 'tabular figures',
      'discretionary ligatures', 'stylistic alternates',
    ],
  },
];

module.exports = { FOUNDRY, SHARED, TYPEFACES };
