'use client'

/* LiquidOverlay — transparent 2D canvas ripples over grass (no WebGL context).
   White ring ripples emanate from cursor; stir enough → fade to white → onComplete. */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const STIR_GOAL = 14.0
const AUTO_MS   = 18000
const FADE_MS   = 900

interface Ripple { x: number; y: number; r: number; opacity: number }

interface Props { onComplete: () => void }

export default function LiquidOverlay({ onComplete }: Props) {
  const divRef      = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const lastPos     = useRef({ x: -1, y: -1 })
  const stirTotal   = useRef(0)
  const completed   = useRef(false)
  const [fading, setFading] = useState(false)

  const triggerComplete = useRef(() => {
    if (completed.current) return
    completed.current = true
    setFading(true)
    setTimeout(() => onComplete(), FADE_MS)
  })

  // 2D ripple animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ripples: Ripple[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn ambient ripples at random positions so there's motion on load
    const spawnAmbient = () => {
      ripples.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0,
        opacity: 0.12,
      })
    }
    const ambientInterval = setInterval(spawnAmbient, 1200)
    spawnAmbient()

    let raf: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r       += 2.5
        rp.opacity -= 0.003
        if (rp.opacity <= 0) { ripples.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${rp.opacity.toFixed(3)})`
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    // Expose addRipple for pointer handler
    ;(canvas as any).__addRipple = (x: number, y: number) => {
      ripples.push({ x, y, r: 0, opacity: 0.35 })
    }

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(ambientInterval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Lock scroll + auto-complete timer
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => triggerComplete.current(), AUTO_MS)
    return () => {
      document.body.style.overflow = prev
      clearTimeout(timer)
    }
  }, [])

  // Touch
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        const nx = t.clientX / window.innerWidth
        const ny = t.clientY / window.innerHeight
        stirTotal.current = Math.min(stirTotal.current + 0.08, STIR_GOAL)
        ;(canvasRef.current as any)?.__addRipple?.(t.clientX, t.clientY)
        lastPos.current = { x: nx, y: ny }
      }
      if (stirTotal.current >= STIR_GOAL) triggerComplete.current()
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const delta = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (delta > 0.002) {
        stirTotal.current = Math.min(stirTotal.current + delta * 3.5, STIR_GOAL)
        ;(canvasRef.current as any)?.__addRipple?.(e.clientX, e.clientY)
        if (stirTotal.current >= STIR_GOAL) triggerComplete.current()
      }
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, cursor: 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Fade to white on complete */}
      {fading && (
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            background:    '#ffffff',
            animation:     `liqFadeWhite ${FADE_MS}ms ease-in forwards`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'clamp(28px, 5vh, 60px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
          fontSize:      '9px',
          fontWeight:    500,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.45)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          opacity:       fading ? 0 : undefined,
          animation:     fading ? 'none' : 'liqHint 2.8s ease-in-out infinite',
        }}
      >
        Stir to enter
      </div>

      <style>{`
        @keyframes liqHint {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.9; }
        }
        @keyframes liqFadeWhite {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body,
  )
}
