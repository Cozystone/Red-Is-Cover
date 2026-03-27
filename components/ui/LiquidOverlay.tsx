'use client'

/* LiquidOverlay — 2D water simulation drives an SVG feImage displacement filter.
   Cursor movement creates ripples that propagate outward (like water).
   Stir enough → white overlay fades in → onComplete. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const STIR_GOAL = 14.0
const AUTO_MS   = 18000

interface Props { onComplete: () => void }

export default function LiquidOverlay({ onComplete }: Props) {
  const divRef       = useRef<HTMLDivElement>(null)
  const whiteRef     = useRef<HTMLDivElement>(null)
  const hintRef      = useRef<HTMLDivElement>(null)
  const volRef       = useRef<HTMLDivElement>(null)
  const volShown     = useRef(false)
  const lastPos      = useRef({ x: -1, y: -1 })
  const stirTotal    = useRef(0)
  const completed    = useRef(false)
  const addRippleRef = useRef<((sx: number, sy: number) => void) | null>(null)

  const triggerComplete = useRef(() => {
    if (completed.current) return
    completed.current = true
    onComplete()
  })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // ── Water simulation ─────────────────────────────────────────────────────
    const SIM_SCALE = 7   // 1 sim pixel = 7 screen pixels (~275×155 @ 1920×1080)
    const simW = Math.ceil(window.innerWidth  / SIM_SCALE)
    const simH = Math.ceil(window.innerHeight / SIM_SCALE)

    const simCanvas = document.createElement('canvas')
    simCanvas.width  = simW
    simCanvas.height = simH
    const simCtx = simCanvas.getContext('2d')!
    const imgData = simCtx.createImageData(simW, simH)
    const { data } = imgData

    // Initialise displacement map to neutral grey (128 = zero displacement)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 128
      data[i + 3] = 255
    }
    simCtx.putImageData(imgData, 0, 0)

    let buf1 = new Float32Array(simW * simH)  // current frame heights
    let buf2 = new Float32Array(simW * simH)  // previous frame heights
    const DAMP = 0.972

    // A few gentle seed disturbances so the surface isn't completely flat on entry
    for (let k = 0; k < 4; k++) {
      const cx = Math.floor((k + 0.5) / 4 * simW)
      const cy = Math.floor(simH / 2 + (k % 2 === 0 ? 12 : -12))
      if (cx > 0 && cx < simW - 1 && cy > 0 && cy < simH - 1)
        buf1[cy * simW + cx] = 100
    }

    // Add a circular ripple at given screen coordinates
    const addRippleAt = (sx: number, sy: number) => {
      const cx = Math.floor(sx / SIM_SCALE)
      const cy = Math.floor(sy / SIM_SCALE)
      const r = 4
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            const x = cx + dx, y = cy + dy
            if (x > 0 && x < simW - 1 && y > 0 && y < simH - 1)
              buf1[y * simW + x] = 280
          }
        }
      }
    }
    addRippleRef.current = addRippleAt

    // ── SVG filter ───────────────────────────────────────────────────────────
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = '__liq_svg__'
    svg.setAttribute('style', 'position:fixed;width:0;height:0;overflow:hidden')

    // Prime feImage with neutral grey so there's no displacement on first paint
    const initHref = simCanvas.toDataURL('image/jpeg', 0.5)
    svg.innerHTML = `<defs>
      <filter id="__liq_f__" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
        <feImage id="__liq_img__" href="${initHref}" preserveAspectRatio="none" result="disp"/>
        <feDisplacementMap in="SourceGraphic" in2="disp"
          scale="30" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>`
    document.body.appendChild(svg)

    const landing = document.getElementById('landing')
    if (landing) landing.style.filter = 'url(#__liq_f__)'

    let raf: number
    let frame = 0

    const tick = () => {
      // Propagate wave: each cell averages neighbours minus its previous value
      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i = y * simW + x
          buf2[i] = (buf1[i - 1] + buf1[i + 1] + buf1[i - simW] + buf1[i + simW]) / 2 - buf2[i]
          buf2[i] *= DAMP
        }
      }
      const tmp = buf1; buf1 = buf2; buf2 = tmp

      // Convert height-map to a gradient-based displacement map image
      // R = horizontal gradient (→ X displacement), G = vertical gradient (→ Y displacement)
      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i   = y * simW + x
          const gx  = buf1[i + 1]    - buf1[i - 1]
          const gy  = buf1[i + simW] - buf1[i - simW]
          const off = i * 4
          data[off]     = Math.min(255, Math.max(0, 128 + gx))
          data[off + 1] = Math.min(255, Math.max(0, 128 + gy))
          // B (off+2) and A (off+3) remain 128 / 255 from init
        }
      }
      simCtx.putImageData(imgData, 0, 0)

      // Push new displacement map to SVG filter every other frame (~30 fps)
      frame++
      if (frame % 2 === 0) {
        const imgEl = document.getElementById('__liq_img__')
        if (imgEl) imgEl.setAttribute('href', simCanvas.toDataURL('image/jpeg', 0.8))
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    const timer = setTimeout(() => triggerComplete.current(), AUTO_MS)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      addRippleRef.current = null
      document.body.style.overflow = prev
      const lnd = document.getElementById('landing')
      if (lnd) lnd.style.filter = ''
      document.getElementById('__liq_svg__')?.remove()
    }
  }, [])

  // Volume hint: visible immediately, fades out after ~2 s
  useEffect(() => {
    // Fade in quickly on mount
    const tIn = setTimeout(() => {
      if (volRef.current) {
        volRef.current.style.transition = 'opacity 0.4s ease'
        volRef.current.style.opacity    = '1'
        volShown.current = true
      }
    }, 80)
    // Auto fade-out after 2.2 s
    const tOut = setTimeout(() => {
      if (volRef.current) {
        volRef.current.style.transition = 'opacity 1.0s ease'
        volRef.current.style.opacity    = '0'
      }
    }, 2200)
    return () => { clearTimeout(tIn); clearTimeout(tOut) }
  }, [])

  const addStir = (delta: number) => {
    stirTotal.current = Math.min(stirTotal.current + delta, STIR_GOAL)
    const p      = stirTotal.current / STIR_GOAL
    const whiteP = Math.max(0, (p - 0.6) / 0.4)   // white starts after 60% stir
    if (whiteRef.current) whiteRef.current.style.opacity = String(whiteP)
    if (hintRef.current)  hintRef.current.style.opacity  = String(Math.max(0, 1 - p * 2))
    if (volRef.current && volShown.current) {
      volRef.current.style.transition = 'opacity 0.6s ease'
      volRef.current.style.opacity    = String(Math.max(0, 1 - p * 2.5))
    }
    if (stirTotal.current >= STIR_GOAL) triggerComplete.current()
  }

  // Touch support
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        addRippleRef.current?.(t.clientX, t.clientY)
        addStir(0.08)
        lastPos.current = { x: t.clientX / window.innerWidth, y: t.clientY / window.innerHeight }
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    addRippleRef.current?.(e.clientX, e.clientY)

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

      {/* Volume hint — fades in after 2.5 s, fades out when stirring */}
      <div ref={volRef} aria-hidden="true"
        style={{
          position: 'absolute', top: 'clamp(20px,4vh,48px)', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontFamily: "'Helvetica Neue',sans-serif",
          fontSize: '8px', fontWeight: 400, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          opacity: 0,
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.7 }}>♪</span>
        turn up your volume
        <span style={{ opacity: 0.45 }}>·</span>
        볼륨을 높이세요
      </div>

      <style>{`@keyframes liqHint{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>,
    document.body,
  )
}
