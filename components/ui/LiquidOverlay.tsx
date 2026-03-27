'use client'

/* LiquidOverlay — SVG feTurbulence filter applied to Landing section.
   No new WebGL context; grass stays fully visible, distorted by the filter.
   Stir → white overlay fades in → onComplete. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const STIR_GOAL = 14.0
const AUTO_MS   = 18000

interface Props { onComplete: () => void }

export default function LiquidOverlay({ onComplete }: Props) {
  const divRef    = useRef<HTMLDivElement>(null)
  const whiteRef  = useRef<HTMLDivElement>(null)
  const hintRef   = useRef<HTMLDivElement>(null)
  const lastPos   = useRef({ x: -1, y: -1 })
  const stirTotal = useRef(0)
  const completed = useRef(false)

  const triggerComplete = useRef(() => {
    if (completed.current) return
    completed.current = true
    onComplete()
  })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Inject SVG filter
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = '__liq_svg__'
    svg.setAttribute('style', 'position:fixed;width:0;height:0;overflow:hidden')
    svg.innerHTML = `<defs>
      <filter id="__liq_f__" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence id="__liq_t__" type="turbulence"
          baseFrequency="0.012 0.008" numOctaves="4" seed="3" result="noise"/>
        <feDisplacementMap id="__liq_d__" in="SourceGraphic" in2="noise"
          scale="14" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>`
    document.body.appendChild(svg)

    // Apply filter to landing section
    const landing = document.getElementById('landing')
    if (landing) landing.style.filter = 'url(#__liq_f__)'

    // Animate turbulence
    let raf: number
    let t = 0
    const tick = () => {
      t += 0.006
      const turb = document.getElementById('__liq_t__')
      if (turb) {
        turb.setAttribute('baseFrequency',
          `${(0.012 + Math.sin(t * 0.6) * 0.006).toFixed(5)} ${(0.008 + Math.cos(t * 0.4) * 0.004).toFixed(5)}`)
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    const timer = setTimeout(() => triggerComplete.current(), AUTO_MS)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      document.body.style.overflow = prev
      const landing = document.getElementById('landing')
      if (landing) landing.style.filter = ''
      document.getElementById('__liq_svg__')?.remove()
    }
  }, [])

  const addStir = (delta: number) => {
    stirTotal.current = Math.min(stirTotal.current + delta, STIR_GOAL)
    const p = stirTotal.current / STIR_GOAL
    if (whiteRef.current) whiteRef.current.style.opacity = String(p)
    if (hintRef.current)  hintRef.current.style.opacity  = String(Math.max(0, 1 - p * 2))
    const disp = document.getElementById('__liq_d__')
    if (disp) disp.setAttribute('scale', String(14 + p * 50))
    if (stirTotal.current >= STIR_GOAL) triggerComplete.current()
  }

  // Touch
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        addStir(0.08)
        lastPos.current = { x: t.clientX / window.innerWidth, y: t.clientY / window.innerHeight }
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const delta = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (delta > 0.002) addStir(delta * 3.5)
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, cursor: 'crosshair' }}
    >
      <div ref={whiteRef} aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0, pointerEvents: 'none' }}
      />
      <div ref={hintRef} aria-hidden="true"
        style={{
          position: 'absolute', bottom: 'clamp(28px,5vh,60px)', left: '50%',
          transform: 'translateX(-50%)', fontFamily: "'Helvetica Neue',sans-serif",
          fontSize: '9px', fontWeight: 500, letterSpacing: '0.30em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          animation: 'liqHint 2.8s ease-in-out infinite',
        }}
      >Stir to enter</div>
      <style>{`@keyframes liqHint{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>,
    document.body,
  )
}
