'use client'

import { useEffect, useRef } from 'react'
import { createGlobe } from '@/lib/globe'

const SCRIM_TOP = 'linear-gradient(to bottom, #f2f1ed 0%, rgba(242,241,237,0.9) 40%, rgba(242,241,237,0) 100%)'
const SCRIM_BTM = 'linear-gradient(to top, #f2f1ed 0%, rgba(242,241,237,0.9) 40%, rgba(242,241,237,0) 100%)'

export function GlobeBackground({ query, dissolving }: { query: string; dissolving: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef  = useRef<ReturnType<typeof createGlobe> | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const variant = window.innerWidth < 768 ? 'mobile' : 'bold'
    const g = createGlobe(canvasRef.current, variant)
    globeRef.current = g
    return () => g.destroy()
  }, [])

  useEffect(() => {
    globeRef.current?.setQuery(query)
  }, [query])

  useEffect(() => {
    if (dissolving) globeRef.current?.dissolve()
    else globeRef.current?.reset()
  }, [dissolving])

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 260, background: SCRIM_TOP, zIndex: 0 }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 260, background: SCRIM_BTM, zIndex: 0 }}
      />
    </div>
  )
}
