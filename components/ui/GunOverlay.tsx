'use client'

// GunOverlay — manages gun state, shatter animation, and persistent bullet hole

import { useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const GunCanvas = dynamic(() => import('./GunCanvas'), { ssr: false })

// ── Types ─────────────────────────────────────────────────────────────────────

interface Crack {
  dx: number
  dy: number
  branches: Array<{ fromFrac: number; dx: number; dy: number }>
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  life: number
  decay: number
  color: string
}

// ── Shatter animation ─────────────────────────────────────────────────────────

function runShatter(
  canvas: HTMLCanvasElement,
  ox: number,
  oy: number,
  onComplete: (cracks: Crack[]) => void,
) {
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // ── Generate cracks ──────────────────────────────────────────────────────
  const NUM  = 22 + Math.floor(Math.random() * 8)
  const diag = Math.hypot(w, h)

  const cracks: Crack[] = Array.from({ length: NUM }, (_, i) => {
    const baseAngle = (i / NUM) * Math.PI * 2
    const jitter    = (Math.random() - 0.5) * (Math.PI / NUM) * 1.8
    const angle     = baseAngle + jitter
    const dist      = diag * (0.7 + Math.random() * 0.6)

    const branches = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => {
      const frac   = 0.15 + Math.random() * 0.55
      const bAngle = angle + (Math.random() - 0.5) * 1.3
      const bDist  = dist  * (0.25 + Math.random() * 0.5)
      return { fromFrac: frac, dx: Math.cos(bAngle) * bDist, dy: Math.sin(bAngle) * bDist }
    })

    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, branches }
  })

  // ── Particles (sparks + debris) ──────────────────────────────────────────
  const particles: Particle[] = Array.from({ length: 80 }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 120 + Math.random() * 520
    const isSpark = Math.random() > 0.5
    return {
      x: ox + (Math.random() - 0.5) * 20,
      y: oy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      size:  isSpark ? 1 + Math.random() * 2 : 2 + Math.random() * 5,
      life:  1,
      decay: 0.8 + Math.random() * 1.8,
      color: isSpark ? `rgba(255,${180 + Math.random() * 75 | 0},0,` : `rgba(40,40,40,`,
    }
  })

  const start = performance.now()
  const TOTAL = 1500   // ms

  function frame(now: number) {
    const t  = Math.min((now - start) / TOTAL, 1)
    const dt = 1 / 60
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'

    // ── Screen shake (first 30%) ───────────────────────────────────────
    const shakeMag = t < 0.30 ? (1 - t / 0.30) * 22 : 0
    const sx = (Math.random() - 0.5) * shakeMag
    const sy = (Math.random() - 0.5) * shakeMag
    ctx.save()
    ctx.translate(sx, sy)

    if (t < 0.50) {
      // ─── Phase 1: explosive crack spread ────────────────────────────
      const p = t / 0.50   // 0→1

      // Progressive darkening
      ctx.fillStyle = `rgba(0,0,0,${p * 0.65})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      // Primary cracks
      for (const crack of cracks) {
        const ex = ox + crack.dx * p
        const ey = oy + crack.dy * p

        // Crack glow (bright core + faint aura)
        ctx.shadowColor = 'rgba(255,255,200,0.6)'
        ctx.shadowBlur  = 4
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = `rgba(255,255,255,${0.95 - p * 0.25})`
        ctx.lineWidth   = 2.2
        ctx.stroke()
        ctx.shadowBlur  = 0

        // Branches appear at 20% progress
        if (p > 0.20) {
          const bp = (p - 0.20) / 0.80
          for (const b of crack.branches) {
            const bx0 = ox + crack.dx * b.fromFrac
            const by0 = oy + crack.dy * b.fromFrac
            ctx.beginPath()
            ctx.moveTo(bx0, by0)
            ctx.lineTo(bx0 + b.dx * bp, by0 + b.dy * bp)
            ctx.strokeStyle = `rgba(255,255,255,${0.65 - bp * 0.3})`
            ctx.lineWidth   = 1.1
            ctx.stroke()
          }
        }
      }

      // Particles
      for (const pt of particles) {
        pt.x  += pt.vx * dt
        pt.y  += pt.vy * dt
        pt.vy += 700 * dt   // gravity
        pt.vx *= 0.96
        pt.life -= pt.decay * dt * (1 / 0.50) * 0.5

        const a = Math.max(0, pt.life)
        if (a <= 0) continue
        ctx.fillStyle = `${pt.color}${a})`
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size)
      }

      // Impact glow
      const gr = 140 * p
      const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, gr)
      grd.addColorStop(0,    `rgba(255,120,0,${p})`)
      grd.addColorStop(0.3,  `rgba(200,20,0,${0.6 * p})`)
      grd.addColorStop(0.7,  `rgba(120,0,0,${0.2 * p})`)
      grd.addColorStop(1,    'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(ox, oy, gr, 0, Math.PI * 2)
      ctx.fill()

    } else if (t < 0.72) {
      // ─── Phase 2: white flash at peak ───────────────────────────────
      const p = (t - 0.50) / 0.22   // 0→1

      ctx.fillStyle = `rgba(0,0,0,${0.65 * (1 - p * 0.4)})`
      ctx.fillRect(-50, -50, w + 100, h + 100)

      // Cracks at full extent
      for (const crack of cracks) {
        ctx.shadowColor = 'rgba(255,255,255,0.3)'
        ctx.shadowBlur  = 3
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ox + crack.dx, oy + crack.dy)
        ctx.strokeStyle = `rgba(255,255,255,${0.9 - p * 0.5})`
        ctx.lineWidth   = 2.2
        ctx.stroke()
        ctx.shadowBlur  = 0

        for (const b of crack.branches) {
          const bx0 = ox + crack.dx * b.fromFrac
          const by0 = oy + crack.dy * b.fromFrac
          ctx.beginPath()
          ctx.moveTo(bx0, by0)
          ctx.lineTo(bx0 + b.dx, by0 + b.dy)
          ctx.strokeStyle = `rgba(255,255,255,${0.55 - p * 0.3})`
          ctx.lineWidth   = 1.1
          ctx.stroke()
        }
      }

      // Searing white flash (peaks at p ≈ 0.45)
      const flash = Math.sin(p * Math.PI) * 0.98
      ctx.fillStyle = `rgba(255,255,255,${flash})`
      ctx.fillRect(0, 0, w, h)

    } else {
      // ─── Phase 3: deep red bleed, cracks darken ─────────────────────
      const p = (t - 0.72) / 0.28   // 0→1

      // Red vignette floods in
      const rv = ctx.createRadialGradient(ox, oy, 0, ox, oy, diag * 0.85)
      rv.addColorStop(0,   `rgba(80,0,5,${p * 0.5})`)
      rv.addColorStop(0.4, `rgba(60,0,3,${p * 0.7})`)
      rv.addColorStop(1,   `rgba(10,0,0,${p * 0.95})`)
      ctx.fillStyle = rv
      ctx.fillRect(0, 0, w, h)

      // Cracks fade to dark red
      for (const crack of cracks) {
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ox + crack.dx, oy + crack.dy)
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.4 - p * 0.4)})`
        ctx.lineWidth   = 2.0
        ctx.stroke()

        for (const b of crack.branches) {
          const bx0 = ox + crack.dx * b.fromFrac
          const by0 = oy + crack.dy * b.fromFrac
          ctx.beginPath()
          ctx.moveTo(bx0, by0)
          ctx.lineTo(bx0 + b.dx, by0 + b.dy)
          ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.25 - p * 0.25)})`
          ctx.lineWidth   = 0.9
          ctx.stroke()
        }
      }
    }

    ctx.restore()

    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      onComplete(cracks)
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
  const ctx = canvas.getContext('2d')!
  const diag = Math.hypot(w, h)

  // Dark vignette centred on impact
  const vgrd = ctx.createRadialGradient(ox, oy, 60, ox, oy, diag * 0.65)
  vgrd.addColorStop(0,   'rgba(0,0,0,0.82)')
  vgrd.addColorStop(0.35,'rgba(0,0,0,0.55)')
  vgrd.addColorStop(1,   'rgba(0,0,0,0.0)')
  ctx.fillStyle = vgrd
  ctx.fillRect(0, 0, w, h)

  // Frozen cracks — dark red/black
  ctx.lineCap = 'round'
  for (const crack of cracks) {
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ox + crack.dx, oy + crack.dy)
    ctx.strokeStyle = 'rgba(15,0,0,0.90)'
    ctx.lineWidth   = 1.6
    ctx.stroke()

    for (const b of crack.branches) {
      const bx0 = ox + crack.dx * b.fromFrac
      const by0 = oy + crack.dy * b.fromFrac
      ctx.beginPath()
      ctx.moveTo(bx0, by0)
      ctx.lineTo(bx0 + b.dx, by0 + b.dy)
      ctx.strokeStyle = 'rgba(15,0,0,0.60)'
      ctx.lineWidth   = 0.8
      ctx.stroke()
    }
  }

  // Blood seep around impact
  const blood = ctx.createRadialGradient(ox, oy, 10, ox, oy, 90)
  blood.addColorStop(0,   'rgba(100,0,8,0.55)')
  blood.addColorStop(0.5, 'rgba(60,0,4,0.25)')
  blood.addColorStop(1,   'transparent')
  ctx.fillStyle = blood
  ctx.beginPath()
  ctx.arc(ox, oy, 90, 0, Math.PI * 2)
  ctx.fill()

  // Bullet hole void
  const HOLE_R = 16
  ctx.beginPath()
  ctx.arc(ox, oy, HOLE_R, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()

  // Scorched rim (bright inner edge → dark outer)
  const rim = ctx.createRadialGradient(ox, oy, HOLE_R - 3, ox, oy, HOLE_R + 18)
  rim.addColorStop(0,   'rgba(140,60,0,0.95)')
  rim.addColorStop(0.4, 'rgba(80,10,0,0.65)')
  rim.addColorStop(1,   'transparent')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(ox, oy, HOLE_R + 18, 0, Math.PI * 2)
  ctx.fill()

  // Micro cracks radiating directly from hole edge (dense inner ring)
  for (let i = 0; i < 32; i++) {
    const a   = (i / 32) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
    const len = 20 + Math.random() * 40
    ctx.beginPath()
    ctx.moveTo(ox + Math.cos(a) * HOLE_R, oy + Math.sin(a) * HOLE_R)
    ctx.lineTo(ox + Math.cos(a) * (HOLE_R + len), oy + Math.sin(a) * (HOLE_R + len))
    ctx.strokeStyle = `rgba(0,0,0,${0.55 + Math.random() * 0.3})`
    ctx.lineWidth   = 0.5 + Math.random() * 0.6
    ctx.stroke()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GunOverlay() {
  const { gunState, shatterOrigin, navButtonPos, grabGun, fireGun } = useGun()
  const shatterRef  = useRef<HTMLCanvasElement>(null)
  const holeRef     = useRef<HTMLCanvasElement>(null)
  const didShatter  = useRef(false)

  // Run shatter then draw persistent bullet hole
  useEffect(() => {
    if (gunState !== 'shattering' || didShatter.current) return
    const canvas = shatterRef.current
    if (!canvas) return
    didShatter.current = true

    const ox = shatterOrigin.x * window.innerWidth
    const oy = shatterOrigin.y * window.innerHeight

    runShatter(canvas, ox, oy, (cracks) => {
      const holeCanvas = holeRef.current
      if (holeCanvas) drawBulletHole(holeCanvas, cracks, ox, oy)
    })
  }, [gunState, shatterOrigin])

  useEffect(() => {
    if (gunState === 'idle') didShatter.current = false
  }, [gunState])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (gunState === 'dropping') grabGun()
      else if (gunState === 'aiming') fireGun(e.clientX, e.clientY)
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
          zIndex:        400,
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
          <GunCanvas gunState={gunState} navButtonPos={navButtonPos} />

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
