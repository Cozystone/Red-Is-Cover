'use client'

import { useRef, useEffect } from 'react'

// ── Blade model ────────────────────────────────────────────────────────────────

interface Blade {
  x: number       // base X on canvas
  z: number       // depth 0=back, 1=front (painter's algorithm order)
  h: number       // natural height in px
  bw: number      // base stroke width
  lean: number    // natural lean (px of tip offset from base)
  phase: number   // phase offset for ambient wind
  disp: number    // current horizontal displacement at tip
  vel: number     // tip horizontal velocity
  // color components (pre-computed for depth)
  cr: number; cg: number; cb: number
}

// ── Config ─────────────────────────────────────────────────────────────────────

const N          = 360
const CANVAS_H   = 340      // canvas height in CSS pixels
const SPRING     = 0.021    // spring constant (return-to-rest force)
const DAMPING    = 0.80     // velocity damping per frame
const AMB_AMP    = 14       // max ambient wind displacement at tip
const AMB_FREQ   = 0.00055  // ambient wave speed
const MOUSE_R    = 200      // cursor influence radius in px
const MOUSE_F    = 22       // cursor wind force multiplier

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeBlades(w: number): Blade[] {
  const blades: Blade[] = []

  for (let i = 0; i < N; i++) {
    const z = Math.random()                      // 0=back, 1=front
    const scale = 0.38 + z * 0.62               // back blades smaller
    const h = (55 + Math.random() * 130) * scale
    const bw = (1.2 + Math.random() * 2.4) * scale + 0.4

    // Green palette: back=dark cool green, front=bright warm green
    const cr = Math.round(8  + z * 28  + Math.random() * 10)
    const cg = Math.round(65 + z * 80  + Math.random() * 20)
    const cb = Math.round(5  + z * 18  + Math.random() * 8)

    blades.push({
      x:     Math.random() * w,
      z,
      h,
      bw,
      lean:  (Math.random() - 0.5) * 22 * scale,
      phase: Math.random() * Math.PI * 2,
      disp:  0,
      vel:   0,
      cr, cg, cb,
    })
  }

  // Sort back-to-front so front blades paint over back blades (3D depth)
  blades.sort((a, b) => a.z - b.z)
  return blades
}

function drawBlade(
  ctx: CanvasRenderingContext2D,
  b: Blade,
  groundY: number
) {
  const totalLean = b.lean + b.disp
  const baseX = b.x
  const baseY = groundY

  // Tip position
  const tipX = baseX + totalLean
  const tipY = baseY - b.h

  // Control point at ~55% height — creates natural S-curve bend
  const ctrlX = baseX + totalLean * 0.42
  const ctrlY = baseY - b.h * 0.55

  // ── Blade body (gradient-like: wide dark base → thin bright tip) ──────────

  // Body stroke
  ctx.beginPath()
  ctx.moveTo(baseX, baseY)
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY)
  ctx.lineWidth  = b.bw
  ctx.lineCap    = 'round'
  ctx.strokeStyle = `rgb(${b.cr},${b.cg},${b.cb})`
  ctx.stroke()

  // Mid-section: slightly lighter
  ctx.beginPath()
  ctx.moveTo(
    baseX + totalLean * 0.25,
    baseY - b.h * 0.25
  )
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY)
  ctx.lineWidth   = b.bw * 0.55
  ctx.strokeStyle = `rgb(${b.cr + 18},${b.cg + 35},${b.cb + 8})`
  ctx.stroke()

  // Tip highlight dot
  ctx.beginPath()
  ctx.arc(tipX, tipY, b.bw * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = `rgb(${b.cr + 35},${b.cg + 55},${b.cb + 12})`
  ctx.fill()
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GrassField() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const bladesRef   = useRef<Blade[]>([])
  const mouseRef    = useRef({ x: -9999, y: 0 })
  const prevXRef    = useRef(-9999)
  const rafRef      = useRef<number>(0)
  const frameRef    = useRef(0)
  const dprRef      = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    dprRef.current = window.devicePixelRatio || 1

    // ── Resize ──────────────────────────────────────────────────────────────

    function resize() {
      const dpr = dprRef.current
      const el  = canvasRef.current!
      const w   = el.offsetWidth
      el.width  = w * dpr
      el.height = CANVAS_H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bladesRef.current = makeBlades(w)
    }

    // ── Render loop ──────────────────────────────────────────────────────────

    function tick() {
      frameRef.current++
      const t  = frameRef.current
      const w  = canvasRef.current?.offsetWidth ?? 0
      const groundY = CANVAS_H

      ctx.clearRect(0, 0, w, CANVAS_H)

      // Ground shadow gradient at base
      const grad = ctx.createLinearGradient(0, CANVAS_H - 40, 0, CANVAS_H)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.35)')
      ctx.fillStyle = grad
      ctx.fillRect(0, CANVAS_H - 40, w, 40)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const b of bladesRef.current) {
        // 1. Ambient wind — sine wave travelling across field
        const ambPhase = b.x * 0.009 + t * AMB_FREQ + b.phase
        const ambient  = Math.sin(ambPhase) * AMB_AMP * b.z * 0.8

        // 2. Mouse wind — blades bend away from cursor
        const dx    = b.x - mx
        // Blade tip Y in screen space (canvas is at bottom of section)
        const bladeTipY = CANVAS_H - b.h
        const dy    = bladeTipY - my
        const dist  = Math.hypot(dx, dy)
        let mouseForce = 0

        if (dist < MOUSE_R) {
          const falloff    = (1 - dist / MOUSE_R) ** 1.6
          const dirX       = dx / (dist + 0.001)
          mouseForce       = dirX * MOUSE_F * falloff * b.z
        }

        // 3. Spring: pull disp toward (lean + ambient)
        const target      = b.lean + ambient
        const springForce = (target - b.disp) * SPRING

        // 4. Physics update
        b.vel  += springForce + mouseForce
        b.vel  *= DAMPING
        b.disp += b.vel

        // Clamp: blades can't bend past 65% of their height
        const cap = b.h * 0.65
        if (b.disp >  cap) b.disp =  cap
        if (b.disp < -cap) b.disp = -cap

        drawBlade(ctx, b, groundY)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    // ── Mouse tracking — listen on window, convert to canvas coords ──────────

    function onMouseMove(e: MouseEvent) {
      const el   = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      prevXRef.current   = mouseRef.current.x
    }

    function onMouseOut() {
      // Fade out gradually — let spring physics handle the return
      mouseRef.current.x = -9999
    }

    resize()
    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseout',  onMouseOut)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseout',  onMouseOut)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        bottom:        0,
        left:          0,
        width:         '100%',
        height:        `${CANVAS_H}px`,
        display:       'block',
        pointerEvents: 'none',
        zIndex:        3,
      }}
    />
  )
}
