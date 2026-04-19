'use client'

import { useEffect, useRef } from 'react'
import { createGlobe } from '@/lib/globe'

interface GlobeBackgroundProps {
  query: string
  loading: boolean
  idle: boolean
}

export function GlobeBackground({ query, loading, idle }: GlobeBackgroundProps) {
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
    if (loading) globeRef.current?.startLoading()
  }, [loading])

  useEffect(() => {
    if (idle) globeRef.current?.stopLoading()
  }, [idle])

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
      />
    </div>
  )
}
