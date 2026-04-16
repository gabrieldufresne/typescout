/**
 * Layout override for the /studio route.
 *
 * The root layout applies the TypeScout dark background and flex column body.
 * This layout ensures the Studio fills the available space cleanly without
 * the TypeScout chrome showing around it.
 *
 * metadata and viewport live here (Server Component) because the page
 * itself requires 'use client' and cannot export them directly.
 */

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }}>
      {children}
    </div>
  )
}
