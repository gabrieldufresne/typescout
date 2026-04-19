import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

interface SlugRecord {
  slug: string
  _updatedAt: string
}

interface FoundrySlugRecord {
  slug: string
  _updatedAt: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://typescout.com'

  // Fetch all published typeface slugs
  const typefaces = await client.fetch<SlugRecord[]>(
    `*[_type == "typeface" && !(_id in path("drafts.**")) && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }`
  )

  // Fetch all foundry slugs
  const foundries = await client.fetch<FoundrySlugRecord[]>(
    `*[_type == "foundry" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }`
  )

  const typefaceRoutes: MetadataRoute.Sitemap = typefaces.map((tf) => ({
    url: `${baseUrl}/typeface/${tf.slug}`,
    lastModified: new Date(tf._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const foundryRoutes: MetadataRoute.Sitemap = foundries.map((f) => ({
    url: `${baseUrl}/foundry/${f.slug}`,
    lastModified: new Date(f._updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...typefaceRoutes,
    ...foundryRoutes,
  ]
}
