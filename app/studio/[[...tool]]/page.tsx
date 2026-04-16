/**
 * Embedded Sanity Studio at /studio.
 *
 * The [[...tool]] catch-all lets the Studio manage its own internal routing
 * (desk, vision, media, etc.) without Next.js intercepting sub-paths.
 *
 * 'use client' is required — @sanity/ui calls createContext which cannot
 * run in a Server Component.
 *
 * metadata and viewport are exported from a separate server-compatible
 * file since they cannot live in a 'use client' module.
 */

'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
