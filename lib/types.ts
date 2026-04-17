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
export type FoundryType = 'independent' | 'commercial' | 'open-source'

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
  foundryType: FoundryType
}

export interface TypefaceResult {
  _id: string
  name: string
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
  hasItalics?: boolean
  multilingualSupport: boolean
  typefaceURL: string
  featured: boolean
  rawKeywords: string[]
}

/** Structured tag object returned by Claude from a natural language query. */
export interface SearchTags {
  classification: string[]
  personalityTags: string[]
  useCaseTags: string[]
  contrast: string[]
  weightRange: string[]
  era: string[]
  /** Free-text foundry name or location extracted from the query. Empty string when not mentioned. */
  foundryQuery: string
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'
