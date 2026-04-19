/**
 * Shared TypeScript types for TypeScout.
 * These mirror the Sanity schema exactly — keep them in sync with sanity/schemaTypes/*.
 */

export type WeightName =
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'

export type Classification =
  | 'serif'
  | 'sans-serif'
  | 'display'
  | 'script'
  | 'monospace'
  | 'slab-serif'
  | 'blackletter'
  | 'decorative'

export type Licensing = 'free' | 'paid'
export type Platform = 'google-fonts' | 'adobe-fonts' | 'both' | 'neither'

export interface SanityImageRef {
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export interface Foundry {
  _id: string
  name: string
  slug: { current: string }
  location: string
  website: string
  description: string
}

export interface TypefaceResult {
  _id: string
  name: string
  slug: string
  _score?: number
  foundry: {
    name: string
    slug: { current: string }
    location: string
  }
  specimenImage: SanityImageRef
  specimenImageHeavy?: SanityImageRef
  editorialNote: string
  classification: Classification[]
  subClassification: string
  personalityTags: string[]
  useCaseTags: string[]
  weightRange: WeightName[]
  width: 'condensed' | 'narrow' | 'normal' | 'wide' | 'extended'
  contrast: ('low' | 'medium' | 'high' | 'monolinear')[]
  xHeight: 'low' | 'medium' | 'tall'
  era: string[]
  licensing: Licensing
  platforms: Platform
  variableFont: boolean
  hasItalics: boolean
  multilingualSupport: boolean
  typefaceURL: string
  featured: boolean
  rawKeywords: string[]
}

export interface TypefaceDetail extends Omit<TypefaceResult, 'foundry'> {
  foundry: Foundry
}

export interface RelatedTypeface {
  _id: string
  name: string
  slug: string
  foundry: { name: string }
  specimenImage: SanityImageRef
  classification: Classification[]
}

/** Structured tag object returned by Claude from a natural language query. */
export interface SearchTags {
  classification: string[]
  personalityTags: string[]
  useCaseTags: string[]
  contrast: string[]
  weightRange: string[]
  width: string[]
  era: string[]
  /** Free-text foundry name or location extracted from the query. Empty string when not mentioned. */
  foundryQuery: string
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'
