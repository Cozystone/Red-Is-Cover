'use client'

// GunOverlay — shatter animation + persistent broken-glass bullet hole

import { useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const GunCanvas = dynamic(() => import('./GunCanvas'), { ssr: false })

// ── Seeded RNG (xorshift32) — fixed seed = same pattern every fire ────────────

function makeRng(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

const CRACK_SEED = 0x9E3779B9

// createRadialGradient throws if r0 or r1 < 0; guard all calls here
function radialGrad(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, r0: number,
  x1: number, y1: number, r1: number,
) {
  return ctx.createRadialGradient(x0, y0, Math.max(0.01, r0), x1, y1, Math.max(0.01, r1))
}

// ── Ring distances from bullet centre (px) ────────────────────────────────────
// Used for both glass-pane cell geometry and concentric ring arcs.
const RINGS = [46, 96, 160, 248, 385, 600]

// ── Types ─────────────────────────────────────────────────────────────────────

interface ZigPt { x: number; y: number }

interface Crack {
  angle:    number    // main direction (for glass pane geometry)
  pts:      ZigPt[]  // very-slight zigzag waypoints for drawing
  branches: Array<{ srcIdx: number; pts: ZigPt[] }>
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; life: number; decay: number; color: string
}

// ── Nearly-straight polyline generator ────────────────────────────────────────
// dispFrac ≤ 0.05 keeps cracks straight like real glass fractures.

function zigzag(
  dx: number, dy: number,
  segs: number, dispFrac: number,
  rng: () => number,
): ZigPt[] {
  const len = Math.hypot(dx, dy) || 1
  const px  = -dy / len, py = dx / len
  const max = len * dispFrac
  const pts: ZigPt[] = [{ x: 0, y: 0 }]
  for (let i = 1; i < segs; i++) {
    const t   = i / segs
    const off = (rng() - 0.5) * 2 * max * Math.sin(t * Math.PI)
    pts.push({ x: dx * t + px * off, y: dy * t + py * off })
  }
  pts.push({ x: dx, y: dy })
  return pts
}

// ── Draw a zigzag polyline at given progress (0-1) ────────────────────────────

function strokeZigzag(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  pts: ZigPt[],
  progress: number,
) {
  if (pts.length < 2 || progress <= 0) return
  const total = pts.length - 1
  const drawn = Math.min(progress, 1) * total
  const full  = Math.floor(drawn)
  const frac  = drawn - full
  ctx.beginPath()
  ctx.moveTo(ox + pts[0].x, oy + pts[0].y)
  for (let i = 0; i < full; i++) ctx.lineTo(ox + pts[i + 1].x, oy + pts[i + 1].y)
  if (full < total && frac > 0) {
    const p0 = pts[full], p1 = pts[full + 1]
    ctx.lineTo(ox + p0.x + (p1.x - p0.x) * frac, oy + p0.y + (p1.y - p0.y) * frac)
  }
  ctx.stroke()
}

// ── Point on a crack at distance d from origin (straight-line approx) ────────

function crackPt(ox: number, oy: number, angle: number, d: number) {
  return { x: ox + Math.cos(angle) * d, y: oy + Math.sin(angle) * d }
}

// ── Crack generator — 16 nearly-straight radial cracks, sorted by angle ──────

function generateCracks(w: number, h: number): Crack[] {
  const rng  = makeRng(CRACK_SEED)
  const NUM  = 16
  const diag = Math.hypot(w, h)

  return Array.from({ length: NUM }, (_, i) => {
    const baseAngle = (i / NUM) * Math.PI * 2
    const jitter    = (rng() - 0.5) * (Math.PI / NUM) * 0.75
    const angle     = baseAngle + jitter
    const dist      = diag * (0.60 + rng() * 0.55)
    const dx        = Math.cos(angle) * dist
    const dy        = Math.sin(angle) * dist
    const mainSegs  = 6 + Math.floor(rng() * 4)
    const pts       = zigzag(dx, dy, mainSegs, 0.05, rng)  // nearly straight

    const branches = Array.from({ length: 1 + Math.floor(rng() * 3) }, () => {
      const srcIdx = 1 + Math.floor(rng() * (pts.length - 2))
      const bAngle = angle + (rng() - 0.5) * 1.2
      const bDist  = dist  * (0.15 + rng() * 0.38)
      const bSegs  = 3 + Math.floor(rng() * 3)
      return {
        srcIdx,
        pts: zigzag(Math.cos(bAngle) * bDist, Math.sin(bAngle) * bDist, bSegs, 0.07, rng),
      }
    })

    return { angle, pts, branches }
  }).sort((a, b) => a.angle - b.angle)   // sort for adjacent-pane computation
}

// ── Draw glass pane quadrilaterals between adjacent radial cracks ─────────────
// Creates a 3D-looking broken glass effect: alternating facets with glass tint.
// At z-index 15, the canvas is above VideoHero so the red Landing shows
// through the semi-transparent pane fills.

function drawGlassPanes(
  ctx:    CanvasRenderingContext2D,
  ox: number, oy: number,
  cracks: Crack[],
  alpha:  number,   // overall opacity multiplier (0-1)
) {
  const N = cracks.length
  for (let r = 1; r < RINGS.length - 1; r++) {
    const r0 = RINGS[r], r1 = RINGS[r + 1]
    const depthT = r / (RINGS.length - 1)   // 0=inner, 1=outer

    for (let i = 0; i < N; i++) {
      const p00 = crackPt(ox, oy, cracks[i].angle,         r0)
      const p10 = crackPt(ox, oy, cracks[(i+1)%N].angle,   r0)
      const p11 = crackPt(ox, oy, cracks[(i+1)%N].angle,   r1)
      const p01 = crackPt(ox, oy, cracks[i].angle,         r1)

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p01.x, p01.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.lineTo(p10.x, p10.y)
      ctx.closePath()

      // Alternating facet brightness simulates 3D glass tilt
      const facet   = (i + r) % 2 === 0
      const baseA   = (0.06 + depthT * 0.10) * alpha
      ctx.fillStyle = facet
        ? `rgba(195, 220, 240, ${baseA})`
        : `rgba(155, 185, 210, ${baseA * 0.72})`
      ctx.fill()

      // Glass edge — bright line where crack edge catches light
      ctx.strokeStyle = `rgba(230, 245, 255, ${(0.10 + depthT * 0.14) * alpha})`
      ctx.lineWidth   = facet ? 0.75 : 0.45
      ctx.stroke()
      ctx.restore()
    }
  }
}

// ── Shatter animation ─────────────────────────────────────────────────────────

function runShatter(
  canvas: HTMLCanvasElement,
  ox: number, oy: number,
  cracks: Crack[],
  onComplete: () => void,
) {
  const w = window.innerWidth, h = window.innerHeight
  canvas.width = w; canvas.height = h
  const ctx  = canvas.getContext('2d')!
  const diag = Math.hypot(w, h)

  const particles: Particle[] = Array.from({ length: 70 }, () => {
    const a = Math.random() * Math.PI * 2
    const s = 100 + Math.random() * 480
    const spark = Math.random() > 0.5
    return {
      x: ox + (Math.random() - 0.5) * 18, y: oy + (Math.random() - 0.5) * 18,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s - 70,
      size:  spark ? 1 + Math.random() * 2 : 2 + Math.random() * 4.5,
      life:  1, decay: 0.9 + Math.random() * 1.6,
      color: spark ? `rgba(255,${180 + (Math.random() * 70 | 0)},0,` : `rgba(35,35,35,`,
    }
  })

  const start = performance.now()
  const TOTAL = 1500

  function frame(now: number) {
    const t  = Math.min((now - start) / TOTAL, 1)
    const dt = 1 / 60
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'

    const shake = t < 0.30 ? (1 - t / 0.30) * 20 : 0
    ctx.save()
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)

    if (t < 0.50) {
      // ── Phase 1: crack spread ──────────────────────────────────────────
      const p = t / 0.50
      ctx.fillStyle = `rgba(0,0,0,${p * 0.60})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      for (const crack of cracks) {
        ctx.shadowColor = 'rgba(220,230,255,0.50)'; ctx.shadowBlur = 5
        ctx.strokeStyle = `rgba(255,255,255,${0.92 - p * 0.22})`
        ctx.lineWidth   = 2.0
        strokeZigzag(ctx, ox, oy, crack.pts, p)
        ctx.shadowBlur  = 0

        if (p > 0.18) {
          const bp = (p - 0.18) / 0.82
          for (const b of crack.branches) {
            const bFrac = b.srcIdx / (crack.pts.length - 1)
            if (bp < bFrac) continue
            const bProg  = (bp - bFrac) / (1 - bFrac)
            const origin = crack.pts[b.srcIdx]
            ctx.strokeStyle = `rgba(255,255,255,${0.58 - bp * 0.28})`
            ctx.lineWidth   = 1.0
            strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, bProg)
          }
        }
      }

      for (const pt of particles) {
        pt.x += pt.vx * dt; pt.y += pt.vy * dt
        pt.vy += 680 * dt; pt.vx *= 0.97
        pt.life -= pt.decay * dt * (1 / 0.50) * 0.5
        const a = Math.max(0, pt.life); if (a <= 0) continue
        ctx.fillStyle = `${pt.color}${a})`
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size)
      }

      const gr  = Math.max(0.01, 130 * p)
      const grd = radialGrad(ctx,ox, oy, 0, ox, oy, gr)
      grd.addColorStop(0,   `rgba(255,110,0,${p})`);   grd.addColorStop(0.3, `rgba(190,18,0,${0.55*p})`)
      grd.addColorStop(0.7, `rgba(110,0,0,${0.18*p})`); grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(ox, oy, gr, 0, Math.PI * 2); ctx.fill()

    } else if (t < 0.72) {
      // ── Phase 2: white flash ───────────────────────────────────────────
      const p = (t - 0.50) / 0.22
      ctx.fillStyle = `rgba(0,0,0,${0.60 * (1 - p * 0.35)})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      for (const crack of cracks) {
        ctx.strokeStyle = `rgba(255,255,255,${0.88 - p * 0.45})`; ctx.lineWidth = 2.0
        strokeZigzag(ctx, ox, oy, crack.pts, 1)
        for (const b of crack.branches) {
          const origin = crack.pts[b.srcIdx]
          ctx.strokeStyle = `rgba(255,255,255,${0.50 - p * 0.28})`; ctx.lineWidth = 0.9
          strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1)
        }
      }

      const flash = Math.sin(p * Math.PI) * 0.95
      ctx.fillStyle = `rgba(255,255,255,${flash})`
      ctx.fillRect(0, 0, w, h)

    } else {
      // ── Phase 3: glass panes visible, red bleed ────────────────────────
      const p = (t - 0.72) / 0.28

      const rv = radialGrad(ctx,ox, oy, 0, ox, oy, diag * 0.82)
      rv.addColorStop(0,   `rgba(75,0,5,${p * 0.45})`);   rv.addColorStop(0.4, `rgba(55,0,3,${p * 0.62})`)
      rv.addColorStop(1,   `rgba(8,0,0,${p * 0.90})`)
      ctx.fillStyle = rv; ctx.fillRect(0, 0, w, h)

      // Glass pane cells — brighter than red bleed, simulating 3D glass facets
      drawGlassPanes(ctx, ox, oy, cracks, p * 0.6)

      for (const crack of cracks) {
        // White cracks fade out
        const wA = Math.max(0, 0.38 - p * 0.38)
        if (wA > 0) { ctx.strokeStyle = `rgba(255,255,255,${wA})`; ctx.lineWidth = 1.8; strokeZigzag(ctx, ox, oy, crack.pts, 1) }
        // Dark cracks fade in (matching hole canvas)
        const dA = p > 0.25 ? (p - 0.25) / 0.75 * 0.90 : 0
        if (dA > 0) { ctx.strokeStyle = `rgba(8,0,0,${dA})`; ctx.lineWidth = 1.6; strokeZigzag(ctx, ox, oy, crack.pts, 1) }
        for (const b of crack.branches) {
          const origin = crack.pts[b.srcIdx]
          const wAb = Math.max(0, 0.22 - p * 0.22)
          if (wAb > 0) { ctx.strokeStyle = `rgba(255,255,255,${wAb})`; ctx.lineWidth = 0.8; strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1) }
          const dAb = p > 0.25 ? (p - 0.25) / 0.75 * 0.55 : 0
          if (dAb > 0) { ctx.strokeStyle = `rgba(8,0,0,${dAb})`; ctx.lineWidth = 0.7; strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1) }
        }
      }
    }

    ctx.restore()
    if (t < 1) requestAnimationFrame(frame)
    else onComplete()
  }

  requestAnimationFrame(frame)
}

// ── Persistent bullet hole ────────────────────────────────────────────────────
// Canvas is at z-index 15 (above main stacking context, above VideoHero).
// Transparent areas show the red Landing behind the faded VideoHero.
// Semi-transparent glass panes + dark crack lines create the broken-glass look.

function drawBulletHole(
  canvas: HTMLCanvasElement,
  cracks: Crack[],
  ox: number, oy: number,
) {
  const w = window.innerWidth, h = window.innerHeight
  canvas.width = w; canvas.height = h
  const ctx  = canvas.getContext('2d')!
  const diag = Math.hypot(w, h)
  const N    = cracks.length
  const HOLE_R = 17

  ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  // ── 1. Localised dark vignette (not full-screen — outer areas stay transparent
  //    so the red Landing shows clearly through the glass pane sections) ────────
  const vgrd = radialGrad(ctx,ox, oy, 28, ox, oy, diag * 0.58)
  vgrd.addColorStop(0,    'rgba(0,0,0,0.72)')
  vgrd.addColorStop(0.18, 'rgba(0,0,0,0.50)')
  vgrd.addColorStop(0.48, 'rgba(0,0,0,0.20)')
  vgrd.addColorStop(1,    'rgba(0,0,0,0.0)')
  ctx.fillStyle = vgrd; ctx.fillRect(0, 0, w, h)

  // ── 2. Glass pane cells (semi-transparent blue-gray glass) ───────────────────
  // Full alpha=1: the red background shows through proportionally to glass alpha.
  drawGlassPanes(ctx, ox, oy, cracks, 1.0)

  // ── 3. Concentric ring arcs connecting adjacent radial cracks ────────────────
  for (let r = 0; r < RINGS.length - 1; r++) {
    const ring_r  = RINGS[r]
    const ringAlpha = Math.max(0.28, 0.80 - r * 0.10)
    const lineW     = Math.max(0.45, 1.1 - r * 0.12)

    for (let i = 0; i < N; i++) {
      const p0 = crackPt(ox, oy, cracks[i].angle,       ring_r)
      const p1 = crackPt(ox, oy, cracks[(i+1)%N].angle, ring_r)
      const midX = (p0.x + p1.x) * 0.5, midY = (p0.y + p1.y) * 0.5
      const midD = Math.hypot(midX - ox, midY - oy) || 1
      // Control point: arc bows slightly outward (convex from center)
      const ctrl = {
        x: ox + (midX - ox) * (ring_r + 11) / midD,
        y: oy + (midY - oy) * (ring_r + 11) / midD,
      }
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y)
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, p1.x, p1.y)
      ctx.strokeStyle = `rgba(8, 0, 0, ${ringAlpha})`
      ctx.lineWidth   = lineW; ctx.stroke()
    }
  }

  // ── 4. Primary radial crack lines (darker than animation — frozen) ───────────
  for (const crack of cracks) {
    ctx.strokeStyle = 'rgba(8,0,0,0.90)'; ctx.lineWidth = 1.6
    strokeZigzag(ctx, ox, oy, crack.pts, 1)
    for (const b of crack.branches) {
      const o = crack.pts[b.srcIdx]
      ctx.strokeStyle = 'rgba(8,0,0,0.55)'; ctx.lineWidth = 0.8
      strokeZigzag(ctx, ox + o.x, oy + o.y, b.pts, 1)
    }
  }

  // ── 5. Crushed glass zone (dense dark mass near hole, 3D depth illusion) ─────
  const crush = radialGrad(ctx,ox, oy, HOLE_R, ox, oy, 68)
  crush.addColorStop(0,   'rgba(18,16,22,0.95)')
  crush.addColorStop(0.5, 'rgba(8,6,12,0.72)')
  crush.addColorStop(1,   'rgba(0,0,0,0.0)')
  ctx.fillStyle = crush; ctx.beginPath(); ctx.arc(ox, oy, 68, 0, Math.PI * 2); ctx.fill()

  // ── 6. Micro-fracture ring (dense radial + arc cracks in crushed zone) ────────
  const rng3 = makeRng(CRACK_SEED ^ 0xC0FFEE)
  for (let i = 0; i < 42; i++) {
    const a    = (i / 42) * Math.PI * 2 + (rng3() - 0.5) * 0.28
    const rIn  = HOLE_R + 2 + rng3() * 7
    const rOut = rIn + 14 + rng3() * 28
    const midA = a + (rng3() - 0.5) * 0.38
    const midR = (rIn + rOut) * 0.5
    ctx.beginPath()
    ctx.moveTo(ox + Math.cos(a) * rIn, oy + Math.sin(a) * rIn)
    ctx.lineTo(ox + Math.cos(midA) * midR + (rng3() - 0.5) * 5,
               oy + Math.sin(midA) * midR + (rng3() - 0.5) * 5)
    ctx.lineTo(ox + Math.cos(a) * rOut, oy + Math.sin(a) * rOut)
    ctx.strokeStyle = `rgba(0,0,0,${0.52 + rng3() * 0.32})`
    ctx.lineWidth   = 0.4 + rng3() * 0.5; ctx.stroke()
  }

  // ── 7. Blood / burn seep at centre ───────────────────────────────────────────
  const blood = radialGrad(ctx,ox, oy, HOLE_R, ox, oy, 92)
  blood.addColorStop(0,   'rgba(110,0,8,0.62)')
  blood.addColorStop(0.4, 'rgba(65,0,4,0.28)')
  blood.addColorStop(1,   'transparent')
  ctx.fillStyle = blood; ctx.beginPath(); ctx.arc(ox, oy, 92, 0, Math.PI * 2); ctx.fill()

  // ── 8. Bullet hole void (slightly oval) ──────────────────────────────────────
  ctx.save(); ctx.translate(ox, oy); ctx.scale(1, 0.85)
  ctx.beginPath(); ctx.arc(0, 0, HOLE_R, 0, Math.PI * 2)
  ctx.fillStyle = '#000'; ctx.fill(); ctx.restore()

  // ── 9. Scorched rim ──────────────────────────────────────────────────────────
  const rim = radialGrad(ctx,ox, oy, HOLE_R - 3, ox, oy, HOLE_R + 24)
  rim.addColorStop(0,    'rgba(215,95,0,0.95)'); rim.addColorStop(0.28, 'rgba(145,32,0,0.78)')
  rim.addColorStop(0.60, 'rgba(55,7,0,0.40)');  rim.addColorStop(1,    'transparent')
  ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(ox, oy, HOLE_R + 24, 0, Math.PI * 2); ctx.fill()

  // ── 10. Spall chips (debris marks around hole) ────────────────────────────────
  const rng4 = makeRng(CRACK_SEED ^ 0xBEEFCAFE)
  for (let i = 0; i < 20; i++) {
    const a  = rng4() * Math.PI * 2
    const d  = HOLE_R + 9 + rng4() * 42
    ctx.beginPath()
    ctx.arc(ox + Math.cos(a) * d, oy + Math.sin(a) * d, 1.5 + rng4() * 3.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,0,0,${0.52 + rng4() * 0.32})`; ctx.fill()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GunOverlay() {
  const { gunState, shatterOrigin, navButtonPos, grabGun, fireGun, updateAimPos } = useGun()
  const shatterRef = useRef<HTMLCanvasElement>(null)
  const holeRef    = useRef<HTMLCanvasElement>(null)
  const didShatter = useRef(false)

  // Reset on each new gun cycle
  useEffect(() => {
    if (gunState !== 'dropping') return
    didShatter.current = false
    const hc = holeRef.current
    if (hc) {
      hc.style.transition = 'none'
      hc.style.opacity    = '0'
      hc.getContext('2d')?.clearRect(0, 0, hc.width, hc.height)
    }
  }, [gunState])

  // Time-based fade-out for bullet hole
  useEffect(() => {
    if (gunState !== 'revealed') return
    const hc = holeRef.current
    if (!hc) return

    const timer = setTimeout(() => {
      hc.style.transition = 'opacity 0.7s ease'
      hc.style.opacity    = '0'
    }, 500)

    return () => clearTimeout(timer)
  }, [gunState])

  // Run shatter animation → draw bullet hole immediately at start
  useEffect(() => {
    if (gunState !== 'shattering' || didShatter.current) return
    const canvas = shatterRef.current
    if (!canvas) return
    didShatter.current = true

    const ox     = shatterOrigin.x * window.innerWidth
    const oy     = shatterOrigin.y * window.innerHeight
    const cracks = generateCracks(window.innerWidth, window.innerHeight)

    // Draw hole immediately — visible from frame 0 alongside cracks
    const hc = holeRef.current
    if (hc) {
      drawBulletHole(hc, cracks, ox, oy)
      hc.style.transition = 'none'
      hc.style.opacity    = '1'
    }

    runShatter(canvas, ox, oy, cracks, () => { /* hole already drawn */ })
  }, [gunState, shatterOrigin])

  const handleClick = useCallback(() => {
    if      (gunState === 'dropping') grabGun()
    else if (gunState === 'aiming')   fireGun()
  }, [gunState, grabGun, fireGun])

  if (gunState === 'idle') return null

  return (
    <>
      {/* ── Persistent bullet hole — z-index 15 = above VideoHero (z:1 in main) ─
           Transparent canvas areas show the red Landing through faded VideoHero. */}
      <canvas
        ref={holeRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        610,
          pointerEvents: 'none',
          width:         '100%',
          height:        '100%',
          opacity:       0,
        }}
      />

      {/* ── 3D gun canvas + click target ──────────────────────────────────────── */}
      {(gunState === 'dropping' || gunState === 'aiming') && (
        <div
          onClick={handleClick}
          style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'all' }}
        >
          <GunCanvas
            gunState={gunState}
            navButtonPos={navButtonPos}
            updateAimPos={updateAimPos}
          />
          <div
            style={{
              position:      'absolute',
              bottom:        '10%',
              left:          '50%',
              transform:     'translateX(-50%)',
              fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
              fontSize:      '10px',
              fontWeight:    600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
              userSelect:    'none',
            }}
          >
            {gunState === 'dropping' ? 'CLICK TO GRAB' : 'AIM AND FIRE'}
          </div>
        </div>
      )}

      {/* ── Shatter canvas (on top during animation) ──────────────────────────── */}
      {gunState === 'shattering' && (
        <canvas
          ref={shatterRef}
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        600,
            pointerEvents: 'none',
            width:         '100%',
            height:        '100%',
          }}
        />
      )}
    </>
  )
}
