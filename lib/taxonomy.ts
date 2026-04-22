/**
 * TypeScout tag taxonomy — single source of truth.
 *
 * All controlled vocabularies live here. Import from this file in:
 *   - sanity/schemaTypes/typeface.ts  (Studio dropdown options)
 *   - app/api/search/route.ts         (Claude system prompt)
 *
 * To add or rename a tag: edit this file only. Both the Studio and
 * the search engine will pick up the change automatically.
 * Update intake-workflow.md's taxonomy reference section to match.
 */

export const CLASSIFICATION = [
  'serif', 'sans-serif', 'display', 'script', 'monospace',
  'slab-serif', 'blackletter', 'decorative',
] as const

export const PERSONALITY_TAGS = [
  'Neutral', 'Expressive', 'Elegant', 'Rugged', 'Friendly', 'Serious',
  'Playful', 'Sophisticated', 'Warm', 'Cold', 'Minimal', 'Loud',
  'Refined', 'Raw', 'Quirky', 'Authoritative', 'Approachable',
  'Luxurious', 'Functional', 'Technical', 'Experimental',
] as const

export const USE_CASE_TAGS = [
  'Branding', 'Packaging', 'Editorial', 'Poster', 'Headline',
  'Body Text', 'Digital UI', 'Technology', 'Logo', 'Signage', 'Motion',
  'Wayfinding', 'Longform Reading', 'Short Copy', 'Captions',
] as const

export const ERA_TAGS = [
  'Contemporary', 'Modernist', 'Swiss', 'Bauhaus', 'Art Deco',
  'Art Nouveau', 'Victorian', 'Retro', 'Vintage', '90s', 'Y2K',
  'Futuristic', 'Heritage', 'Vernacular', 'Constructivist',
] as const

export const WEIGHT_RANGE = [
  'thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black',
] as const

export const CONTRAST = ['low', 'medium', 'high', 'monolinear'] as const

export const WIDTH = ['condensed', 'narrow', 'normal', 'wide', 'extended'] as const

export const X_HEIGHT = ['low', 'medium', 'tall'] as const
