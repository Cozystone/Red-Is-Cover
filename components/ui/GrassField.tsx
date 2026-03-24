'use client'

import { useRef, useEffect } from 'react'

// ── Blade model ────────────────────────────────────────────────────────────────

interface Blade {
  x:     number   // base X on canvas
  z:     number   // depth 0=back, 1=front (painter's order)
  h:     number   // natural height in px
  hw:    number   // half-width at base (tapers to 0 at tip)
  lean:  number   // natural rest lean (tip offset from base, px)
  phase: number   // phase offset for wind wave
  disp:  number   // current tip displacement from rest
  vel:   number   // tip velocity
  cr: number; cg: number; cb: number   // base colour
}

// ── Config ─────────────────────────────────────────────────────────────────────

const N        = 400       // blade count
const CANVAS_H = 360       // canvas CSS height in px
const SPRING   = 0.018     // spring constant (return-to-rest)
const DAMPING  = 0.78      // velocity damping per frame
const AMB_AMP  = 18        // max ambient wind displacement at tip
const AMB_FREQ = 0.00050   // ambient wave speed (frames)
const MOUSE_R  = 220       // cursor influence radius in px
const BRUSH_F  = 0.30      // cursor brush force (velocity-based)

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeBlades(w: number): Blade[] {
  const blades: Blade[] = []

  for (let i = 0; i < N; i++) {
    const z     = Math.random()                     // 0=back, 1=front
    const scale = 0.36 + z * 0.64
    const h     = (60 + Math.random() * 140) * scale
    const hw    = (2.0 + Math.random() * 3.5) * scale  // half-width at base

    // Colour: back=dark cool green, front=bright warm green with olive tints
    const cr = Math.round(6  + z * 30  + Math.random() * 12)
    const cg = Math.round(60 + z * 85  + Math.random() * 22)
    const cb = Math.round(4  + z * 16  + Math.random() * 8)

    blades.push({
      x:     Math.random() * w,
      z,
      h,
      hw,
      lean:  (Math.random() - 0.5) * 24 * scale,
      phase: Math.random() * Math.PI * 2,
      disp:  0,
      vel:   0,
      cr, cg, cb,
    })
  }

  blades.sort((a, b) => a.z - b.z)
  return blades
}

// ── Blade drawing: real grass shape — tapered filled bezier ───────────────────
// Wide at base, narrows smoothly to a fine tip. Two quadratic bezier curves
// form the left/right edges; a centre-vein highlight sits on top.

function drawBlade(ctx: CanvasRenderingContext2D, b: Blade, groundY: number) {
  const totalLean = b.lean + b.disp
  const bx = b.x
  const by = groundY
  const tx = bx + totalLean          // tip x
  const ty = by - b.h                // tip y

  // Control point at ~52% height — produces natural S-curve bend
  const cx = bx + totalLean * 0.44
  const cy = by - b.h * 0.52

  const hw = b.hw

  // ── Filled blade path: left edge up → tip → right edge down ──────────────
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(bx - hw,      by)
  // Left edge: control point shifted inward at half-width, zero at tip
  ctx.quadraticCurveTo(cx - hw * 0.35, cy, tx, ty)
  // Right edge: mirror
  ctx.quadraticCurveTo(cx + hw * 0.35, cy, bx + hw, by)
  ctx.closePath()

  // Vertical gradient: dark rich at base → lighter yellow-green at tip
  const grad = ctx.createLinearGradient(bx, by, tx, ty)
  grad.addColorStop(0,    `rgb(${b.cr},       ${b.cg},       ${b.cb})`)
  grad.addColorStop(0.45, `rgb(${b.cr + 14},  ${b.cg + 42},  ${b.cb + 8})`)
  grad.addColorStop(1,    `rgb(${b.cr + 28},  ${b.cg + 70},  ${b.cb + 16})`)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // ── Centre vein (subtle lighter highlight) ────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.quadraticCurveTo(cx, cy, tx, ty)
  ctx.lineWidth   = hw * 0.22
  ctx.lineCap     = 'round'
  ctx.strokeStyle = `rgba(${b.cr + 50},${b.cg + 90},${b.cb + 22},0.28)`
  ctx.stroke()
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GrassField() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const bladesRef  = useRef<Blade[]>([])
  const mouseRef   = useRef({ x: -9999, y: 0 })
  const prevXRef   = useRef(-9999)    // previous frame mouse X for velocity
  const rafRef     = useRef<number>(0)
  const frameRef   = useRef(0)
  const dprRef     = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    dprRef.current = window.devicePixelRatio || 1

    // ── Resize ────────────────────────────────────────────────────────────────

    function resize() {
      const dpr = dprRef.current
      const el  = canvasRef.current!
      const w   = el.offsetWidth
      el.width  = w * dpr
      el.height = CANVAS_H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bladesRef.current = makeBlades(w)
    }

    // ── Render loop ───────────────────────────────────────────────────────────

    function tick() {
      frameRef.current++
      const t       = frameRef.current
      const w       = canvasRef.current?.offsetWidth ?? 0
      const groundY = CANVAS_H

      ctx.clearRect(0, 0, w, CANVAS_H)

      // Ground shadow at base
      const grad = ctx.createLinearGradient(0, CANVAS_H - 50, 0, CANVAS_H)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.40)')
      ctx.fillStyle = grad
      ctx.fillRect(0, CANVAS_H - 50, w, 50)

      const mx = mouseRef.current.x

      // Cursor velocity (px/frame) — used for brush-style interaction
      const cursorVelX = (prevXRef.current !== -9999 && mx !== -9999)
        ? (mx - prevXRef.current) * 0.8
        : 0
      prevXRef.current = mx

      for (const b of bladesRef.current) {
        // ── Ambient wind: two overlapping sine waves, travelling across field
        const wave1  = Math.sin(b.x * 0.009 + t * AMB_FREQ + b.phase)
        const wave2  = Math.sin(b.x * 0.005 + t * AMB_FREQ * 0.61 + b.phase * 1.8) * 0.38
        const ambient = (wave1 + wave2) * AMB_AMP * b.z * 0.85

        // ── Cursor brush: push in the direction cursor is moving ──────────
        // Unlike flee-from-cursor, this feels like wind from cursor motion.
        // Blades bend in the direction cursor sweeps; spring back after.
        let brushForce = 0
        if (mx !== -9999 && Math.abs(cursorVelX) > 0.5) {
          const bladeTipY = CANVAS_H - b.h * 0.5   // approximate tip Y
          const dx  = b.x - mx
          const dy  = bladeTipY - mouseRef.current.y
          const dist = Math.hypot(dx, dy)
          if (dist < MOUSE_R) {
            const falloff = (1 - dist / MOUSE_R) ** 1.5
            brushForce = cursorVelX * BRUSH_F * falloff * b.z
          }
        }

        // ── Spring physics ────────────────────────────────────────────────
        const target      = b.lean + ambient
        const springForce = (target - b.disp) * SPRING

        b.vel  += springForce + brushForce
        b.vel  *= DAMPING
        b.disp += b.vel

        // Clamp: blades can't bend past 70% of height
        const cap = b.h * 0.70
        b.disp = Math.max(-cap, Math.min(cap, b.disp))

        drawBlade(ctx, b, groundY)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    // ── Mouse tracking — listen on window, convert to canvas local coords ──

    function onMouseMove(e: MouseEvent) {
      const el = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    function onMouseOut() {
      mouseRef.current.x = -9999
      prevXRef.current   = -9999
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
