'use client'

// GunOverlay — manages gun state, shatter animation, and persistent bullet hole

import { useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const GunCanvas = dynamic(() => import('./GunCanvas'), { ssr: false })

// ── Seeded RNG (xorshift32) ───────────────────────────────────────────────────
// Fixed seed → same crack pattern every time

function makeRng(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ZigPt { x: number; y: number }

interface Crack {
  pts:      ZigPt[]   // relative to origin — [0,0] zigzag → [dx,dy]
  branches: Array<{
    srcIdx: number    // index in parent pts[] where branch starts
    pts:    ZigPt[]   // relative to branch start point
  }>
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  life: number
  decay: number
  color: string
}

// ── Zigzag polyline generator ─────────────────────────────────────────────────

function zigzag(
  dx: number, dy: number,
  segs: number,
  dispFrac: number,
  rng: () => number,
): ZigPt[] {
  const len    = Math.hypot(dx, dy) || 1
  const perpX  = -dy / len
  const perpY  =  dx / len
  const maxOff = len * dispFrac

  const pts: ZigPt[] = [{ x: 0, y: 0 }]
  for (let i = 1; i < segs; i++) {
    const t   = i / segs
    const mx  = dx * t
    const my  = dy * t
    // Offset peaks in the middle (sin envelope), alternates direction sharply
    const off = (rng() - 0.5) * 2 * maxOff * Math.sin(t * Math.PI)
    pts.push({ x: mx + perpX * off, y: my + perpY * off })
  }
  pts.push({ x: dx, y: dy })
  return pts
}

// ── Draw zigzag path (progressive) ───────────────────────────────────────────

function strokeZigzag(
  ctx:      CanvasRenderingContext2D,
  ox: number, oy: number,
  pts:      ZigPt[],
  progress: number,   // 0-1
) {
  if (pts.length < 2 || progress <= 0) return
  const totalSegs = pts.length - 1
  const drawn     = Math.min(progress, 1) * totalSegs
  const fullSegs  = Math.floor(drawn)
  const frac      = drawn - fullSegs

  ctx.beginPath()
  ctx.moveTo(ox + pts[0].x, oy + pts[0].y)
  for (let i = 0; i < fullSegs; i++) {
    ctx.lineTo(ox + pts[i + 1].x, oy + pts[i + 1].y)
  }
  if (fullSegs < totalSegs && frac > 0) {
    const p0 = pts[fullSegs]
    const p1 = pts[fullSegs + 1]
    ctx.lineTo(ox + p0.x + (p1.x - p0.x) * frac, oy + p0.y + (p1.y - p0.y) * frac)
  }
  ctx.stroke()
}

// ── Generate deterministic crack set ─────────────────────────────────────────

const CRACK_SEED = 0x9E3779B9   // fixed seed → same pattern every fire

function generateCracks(w: number, h: number): Crack[] {
  const rng  = makeRng(CRACK_SEED)
  const NUM  = 24
  const diag = Math.hypot(w, h)

  return Array.from({ length: NUM }, (_, i) => {
    const baseAngle  = (i / NUM) * Math.PI * 2
    const jitter     = (rng() - 0.5) * (Math.PI / NUM) * 1.6
    const angle      = baseAngle + jitter
    const dist       = diag * (0.65 + rng() * 0.55)
    const dx         = Math.cos(angle) * dist
    const dy         = Math.sin(angle) * dist
    const mainSegs   = 8 + Math.floor(rng() * 5)   // 8-12 segments
    const pts        = zigzag(dx, dy, mainSegs, 0.13, rng)

    const numBranches = 2 + Math.floor(rng() * 3)
    const branches = Array.from({ length: numBranches }, () => {
      const srcIdx = 1 + Math.floor(rng() * (pts.length - 2))
      const bAngle = angle + (rng() - 0.5) * 1.4
      const bDist  = dist  * (0.2 + rng() * 0.45)
      const bdx    = Math.cos(bAngle) * bDist
      const bdy    = Math.sin(bAngle) * bDist
      const bSegs  = 4 + Math.floor(rng() * 4)
      return { srcIdx, pts: zigzag(bdx, bdy, bSegs, 0.16, rng) }
    })

    return { pts, branches }
  })
}

// ── Shatter animation ─────────────────────────────────────────────────────────

function runShatter(
  canvas:     HTMLCanvasElement,
  ox: number, oy: number,
  cracks:     Crack[],
  onComplete: () => void,
) {
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width  = w
  canvas.height = h
  const ctx  = canvas.getContext('2d')!
  const diag = Math.hypot(w, h)

  // Particles (sparks + debris) — these CAN stay random for liveliness
  const particles: Particle[] = Array.from({ length: 80 }, () => {
    const angle   = Math.random() * Math.PI * 2
    const speed   = 120 + Math.random() * 520
    const isSpark = Math.random() > 0.5
    return {
      x:     ox + (Math.random() - 0.5) * 20,
      y:     oy + (Math.random() - 0.5) * 20,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed - 80,
      size:  isSpark ? 1 + Math.random() * 2 : 2 + Math.random() * 5,
      life:  1,
      decay: 0.8 + Math.random() * 1.8,
      color: isSpark ? `rgba(255,${180 + (Math.random() * 75 | 0)},0,` : `rgba(40,40,40,`,
    }
  })

  const start = performance.now()
  const TOTAL = 1500   // ms

  function frame(now: number) {
    const t  = Math.min((now - start) / TOTAL, 1)
    const dt = 1 / 60
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap  = 'round'
    ctx.lineJoin = 'round'

    // Screen shake (first 30%)
    const shakeMag = t < 0.30 ? (1 - t / 0.30) * 22 : 0
    const sx = (Math.random() - 0.5) * shakeMag
    const sy = (Math.random() - 0.5) * shakeMag
    ctx.save()
    ctx.translate(sx, sy)

    if (t < 0.50) {
      // ── Phase 1: crack spread ─────────────────────────────────────────
      const p = t / 0.50

      ctx.fillStyle = `rgba(0,0,0,${p * 0.65})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      // Primary cracks (zigzag, progressive)
      for (const crack of cracks) {
        ctx.shadowColor = 'rgba(255,255,200,0.55)'
        ctx.shadowBlur  = 4
        ctx.strokeStyle = `rgba(255,255,255,${0.95 - p * 0.25})`
        ctx.lineWidth   = 2.2
        strokeZigzag(ctx, ox, oy, crack.pts, p)
        ctx.shadowBlur  = 0

        // Branches appear after 20% progress
        if (p > 0.20) {
          const bp = (p - 0.20) / 0.80
          for (const b of crack.branches) {
            const bFrac = b.srcIdx / (crack.pts.length - 1)
            if (bp < bFrac) continue
            const bProg = (bp - bFrac) / (1 - bFrac)
            const origin = crack.pts[b.srcIdx]
            ctx.strokeStyle = `rgba(255,255,255,${0.60 - bp * 0.3})`
            ctx.lineWidth   = 1.1
            strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, bProg)
          }
        }
      }

      // Particles
      for (const pt of particles) {
        pt.x  += pt.vx * dt
        pt.y  += pt.vy * dt
        pt.vy += 700 * dt
        pt.vx *= 0.96
        pt.life -= pt.decay * dt * (1 / 0.50) * 0.5
        const a = Math.max(0, pt.life)
        if (a <= 0) continue
        ctx.fillStyle = `${pt.color}${a})`
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size)
      }

      // Impact glow
      const gr  = 140 * p
      const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, gr)
      grd.addColorStop(0,   `rgba(255,120,0,${p})`)
      grd.addColorStop(0.3, `rgba(200,20,0,${0.6 * p})`)
      grd.addColorStop(0.7, `rgba(120,0,0,${0.2 * p})`)
      grd.addColorStop(1,   'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(ox, oy, gr, 0, Math.PI * 2)
      ctx.fill()

    } else if (t < 0.72) {
      // ── Phase 2: white flash at peak ─────────────────────────────────
      const p = (t - 0.50) / 0.22

      ctx.fillStyle = `rgba(0,0,0,${0.65 * (1 - p * 0.4)})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      for (const crack of cracks) {
        ctx.shadowColor = 'rgba(255,255,255,0.25)'
        ctx.shadowBlur  = 3
        ctx.strokeStyle = `rgba(255,255,255,${0.9 - p * 0.5})`
        ctx.lineWidth   = 2.2
        strokeZigzag(ctx, ox, oy, crack.pts, 1)
        ctx.shadowBlur  = 0

        for (const b of crack.branches) {
          const origin = crack.pts[b.srcIdx]
          ctx.strokeStyle = `rgba(255,255,255,${0.55 - p * 0.3})`
          ctx.lineWidth   = 1.1
          strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1)
        }
      }

      const flash = Math.sin(p * Math.PI) * 0.98
      ctx.fillStyle = `rgba(255,255,255,${flash})`
      ctx.fillRect(0, 0, w, h)

    } else {
      // ── Phase 3: deep red bleed, cracks darken ───────────────────────
      const p = (t - 0.72) / 0.28

      const rv = ctx.createRadialGradient(ox, oy, 0, ox, oy, diag * 0.85)
      rv.addColorStop(0,   `rgba(80,0,5,${p * 0.5})`)
      rv.addColorStop(0.4, `rgba(60,0,3,${p * 0.7})`)
      rv.addColorStop(1,   `rgba(10,0,0,${p * 0.95})`)
      ctx.fillStyle = rv
      ctx.fillRect(0, 0, w, h)

      for (const crack of cracks) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.4 - p * 0.4)})`
        ctx.lineWidth   = 2.0
        strokeZigzag(ctx, ox, oy, crack.pts, 1)

        for (const b of crack.branches) {
          const origin = crack.pts[b.srcIdx]
          ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.25 - p * 0.25)})`
          ctx.lineWidth   = 0.9
          strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1)
        }
      }
    }

    ctx.restore()

    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      onComplete()
    }
  }

  requestAnimationFrame(frame)
}

// ── Persistent bullet hole ────────────────────────────────────────────────────

function drawBulletHole(
  canvas: HTMLCanvasElement,
  cracks: Crack[],
  ox: number,
  oy: number,
) {
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width  = w
  canvas.height = h
  const ctx  = canvas.getContext('2d')!
  const diag = Math.hypot(w, h)

  ctx.lineCap  = 'round'
  ctx.lineJoin = 'round'

  // ── 1. Dark vignette centred on impact ───────────────────────────────────
  const vgrd = ctx.createRadialGradient(ox, oy, 40, ox, oy, diag * 0.70)
  vgrd.addColorStop(0,    'rgba(0,0,0,0.88)')
  vgrd.addColorStop(0.25, 'rgba(0,0,0,0.65)')
  vgrd.addColorStop(0.65, 'rgba(0,0,0,0.28)')
  vgrd.addColorStop(1,    'rgba(0,0,0,0.0)')
  ctx.fillStyle = vgrd
  ctx.fillRect(0, 0, w, h)

  // ── 2. Frozen zigzag cracks — dark red/black ─────────────────────────────
  for (const crack of cracks) {
    ctx.strokeStyle = 'rgba(12,0,0,0.92)'
    ctx.lineWidth   = 1.7
    strokeZigzag(ctx, ox, oy, crack.pts, 1)

    for (const b of crack.branches) {
      const origin = crack.pts[b.srcIdx]
      ctx.strokeStyle = 'rgba(12,0,0,0.58)'
      ctx.lineWidth   = 0.85
      strokeZigzag(ctx, ox + origin.x, oy + origin.y, b.pts, 1)
    }
  }

  // ── 3. Fracture zone rings around impact (concentric arcs) ───────────────
  const HOLE_R = 20
  const rng2   = makeRng(CRACK_SEED ^ 0xDEADBEEF)
  for (let ring = 1; ring <= 3; ring++) {
    const r       = HOLE_R + ring * 18 + ring * ring * 4
    const numArcs = 10 + ring * 4
    for (let i = 0; i < numArcs; i++) {
      const startA = (i / numArcs) * Math.PI * 2 + (rng2() - 0.5) * 0.4
      const sweep  = (rng2() * 0.3 + 0.1) * Math.PI
      ctx.beginPath()
      ctx.arc(ox, oy, r, startA, startA + sweep)
      ctx.strokeStyle = `rgba(8,0,0,${0.55 - ring * 0.1})`
      ctx.lineWidth   = 0.8 - ring * 0.15
      ctx.stroke()
    }
  }

  // ── 4. Blood/burn seep around impact ─────────────────────────────────────
  const blood = ctx.createRadialGradient(ox, oy, HOLE_R, ox, oy, 120)
  blood.addColorStop(0,   'rgba(120,0,8,0.72)')
  blood.addColorStop(0.35,'rgba(80,0,4,0.40)')
  blood.addColorStop(0.7, 'rgba(30,0,2,0.15)')
  blood.addColorStop(1,   'transparent')
  ctx.fillStyle = blood
  ctx.beginPath()
  ctx.arc(ox, oy, 120, 0, Math.PI * 2)
  ctx.fill()

  // ── 5. Bullet hole void ───────────────────────────────────────────────────
  // Slightly irregular shape (not a perfect circle)
  ctx.save()
  ctx.translate(ox, oy)
  ctx.scale(1, 0.88)
  ctx.beginPath()
  ctx.arc(0, 0, HOLE_R, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.restore()

  // ── 6. Scorched rim (bright inner edge → dark outer) ─────────────────────
  const rim = ctx.createRadialGradient(ox, oy, HOLE_R - 4, ox, oy, HOLE_R + 26)
  rim.addColorStop(0,   'rgba(200,90,0,0.98)')
  rim.addColorStop(0.25,'rgba(140,30,0,0.80)')
  rim.addColorStop(0.55,'rgba(60,8,0,0.45)')
  rim.addColorStop(1,   'transparent')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(ox, oy, HOLE_R + 26, 0, Math.PI * 2)
  ctx.fill()

  // Burn char ring (very dark, just outside the hot orange rim)
  const char = ctx.createRadialGradient(ox, oy, HOLE_R + 20, ox, oy, HOLE_R + 60)
  char.addColorStop(0,   'rgba(0,0,0,0.65)')
  char.addColorStop(0.5, 'rgba(0,0,0,0.25)')
  char.addColorStop(1,   'transparent')
  ctx.fillStyle = char
  ctx.beginPath()
  ctx.arc(ox, oy, HOLE_R + 60, 0, Math.PI * 2)
  ctx.fill()

  // ── 7. Micro cracks radiating from hole edge ──────────────────────────────
  const rng3 = makeRng(CRACK_SEED ^ 0xC0FFEE)
  for (let i = 0; i < 36; i++) {
    const a   = (i / 36) * Math.PI * 2 + (rng3() - 0.5) * 0.25
    const len = 22 + rng3() * 50
    // Slight zigzag even on micro cracks
    const midA   = a + (rng3() - 0.5) * 0.35
    const midLen = (HOLE_R + len * 0.45)
    ctx.beginPath()
    ctx.moveTo(ox + Math.cos(a) * HOLE_R, oy + Math.sin(a) * HOLE_R)
    ctx.lineTo(ox + Math.cos(midA) * midLen, oy + Math.sin(midA) * midLen)
    ctx.lineTo(ox + Math.cos(a) * (HOLE_R + len), oy + Math.sin(a) * (HOLE_R + len))
    ctx.strokeStyle = `rgba(0,0,0,${0.50 + rng3() * 0.35})`
    ctx.lineWidth   = 0.4 + rng3() * 0.55
    ctx.stroke()
  }

  // ── 8. Spall chips around hole (debris marks) ────────────────────────────
  const rng4 = makeRng(CRACK_SEED ^ 0xBEEFCAFE)
  for (let i = 0; i < 18; i++) {
    const a = rng4() * Math.PI * 2
    const d = HOLE_R + 8 + rng4() * 35
    const cx2 = ox + Math.cos(a) * d
    const cy2 = oy + Math.sin(a) * d
    const r2  = 1.5 + rng4() * 4
    ctx.beginPath()
    ctx.arc(cx2, cy2, r2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,0,0,${0.55 + rng4() * 0.30})`
    ctx.fill()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GunOverlay() {
  const { gunState, shatterOrigin, navButtonPos, grabGun, fireGun, updateAimPos } = useGun()
  const shatterRef = useRef<HTMLCanvasElement>(null)
  const holeRef    = useRef<HTMLCanvasElement>(null)
  const didShatter = useRef(false)

  // Reset when a new gun sequence starts
  useEffect(() => {
    if (gunState !== 'dropping') return
    didShatter.current = false
    const holeCanvas = holeRef.current
    if (holeCanvas) {
      const ctx2 = holeCanvas.getContext('2d')
      ctx2?.clearRect(0, 0, holeCanvas.width, holeCanvas.height)
    }
  }, [gunState])

  // Run shatter then draw persistent bullet hole
  useEffect(() => {
    if (gunState !== 'shattering' || didShatter.current) return
    const canvas = shatterRef.current
    if (!canvas) return
    didShatter.current = true

    const ox = shatterOrigin.x * window.innerWidth
    const oy = shatterOrigin.y * window.innerHeight
    const w  = window.innerWidth
    const h  = window.innerHeight

    // Generate once — same pattern every fire
    const cracks = generateCracks(w, h)

    runShatter(canvas, ox, oy, cracks, () => {
      const holeCanvas = holeRef.current
      if (holeCanvas) drawBulletHole(holeCanvas, cracks, ox, oy)
    })
  }, [gunState, shatterOrigin])

  const handleClick = useCallback(
    () => {
      if      (gunState === 'dropping') grabGun()
      else if (gunState === 'aiming')   fireGun()
    },
    [gunState, grabGun, fireGun],
  )

  if (gunState === 'idle') return null

  return (
    <>
      {/* ── Persistent bullet hole — always mounted, fades in on revealed ── */}
      <canvas
        ref={holeRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        0,
          pointerEvents: 'none',
          width:         '100%',
          height:        '100%',
          opacity:       gunState === 'revealed' ? 1 : 0,
          transition:    'opacity 0.5s ease',
        }}
      />

      {/* ── 3D gun canvas ─────────────────────────────────────────────────── */}
      {(gunState === 'dropping' || gunState === 'aiming') && (
        <div
          onClick={handleClick}
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        500,
            pointerEvents: 'all',
          }}
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

      {/* ── Shatter canvas ─────────────────────────────────────────────────── */}
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
