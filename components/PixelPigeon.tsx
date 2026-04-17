'use client'

import { useEffect, useRef } from 'react'

// ── Pixel map is loaded from public/pigeon-map.txt at runtime.
// Edit that file to change the pigeon silhouette — no code changes needed.
// Format: one row per line, 0 = empty cell, 1 = active cell.

const IDLE_CHARS = ['T', 'Y', 'P', 'E']

interface Cell {
  char: string
  solid: boolean
  nextFlip: number
  interval: number
}

export function PixelPigeon({ activeChar }: { activeChar: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cellsRef = useRef<(Cell | null)[][]>([])
  const activeCharRef = useRef(activeChar)
  const rafRef = useRef<number>(0)
  const dimsRef = useRef({ rows: 0, cols: 0 })

  useEffect(() => {
    activeCharRef.current = activeChar
    if (activeChar) {
      cellsRef.current.forEach(row =>
        row.forEach(cell => { if (cell) cell.char = activeChar })
      )
    }
  }, [activeChar])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cssWidth = window.innerWidth
    let cssHeight = window.innerHeight

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      cssWidth = window.innerWidth
      cssHeight = window.innerHeight
      canvas.width = cssWidth * dpr
      canvas.height = cssHeight * dpr
      canvas.style.width = cssWidth + 'px'
      canvas.style.height = cssHeight + 'px'
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Load silhouette from public/pigeon-map.txt
    fetch('/pigeon-map.txt')
      .then(r => r.text())
      .then(text => {
        const lines = text.split('\n').filter(l => !l.startsWith('#') && l.trim().length > 0)
        const map = lines.map(line => line.trim().split('').map(c => (c === '1' ? 1 : 0)))
        dimsRef.current = { rows: map.length, cols: map[0]?.length ?? 0 }
        cellsRef.current = map.map(row =>
          row.map(v => {
            if (!v) return null
            return {
              char: IDLE_CHARS[Math.floor(Math.random() * IDLE_CHARS.length)],
              solid: Math.random() > 0.5,
              nextFlip: performance.now() + Math.random() * 4800,
              interval: 1400 + Math.random() * 3200,
            }
          })
        )
      })

    const draw = (now: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { rows, cols } = dimsRef.current
      if (!rows || !cols) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const cellSize = Math.floor((cssHeight * 0.82) / rows)
      const fontSize  = Math.floor(cellSize * 0.85)
      const gridW     = cols * cellSize
      const gridH     = rows * cellSize
      const offsetX   = Math.floor((cssWidth - gridW) / 2)
      const offsetY   = Math.floor((cssHeight - gridH) / 2 - cssHeight * 0.04)

      ctx.clearRect(0, 0, cssWidth, cssHeight)
      ctx.fillStyle = '#BFBEB8'
      ctx.font = `${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      cellsRef.current.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (!cell) return

          if (now >= cell.nextFlip) {
            cell.solid = !cell.solid
            cell.nextFlip = now + cell.interval + Math.random() * 1200
            if (!activeCharRef.current) {
              cell.char = IDLE_CHARS[Math.floor(Math.random() * IDLE_CHARS.length)]
            }
          }

          const x = offsetX + c * cellSize + cellSize / 2
          const y = offsetY + r * cellSize + cellSize / 2

          if (cell.solid) {
            ctx.font = `${Math.floor(cellSize * 1.1)}px monospace`
            ctx.fillText('•', x, y)
            ctx.font = `${fontSize}px monospace`
          } else {
            ctx.fillText(cell.char, x, y)
          }
        })
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  )
}
