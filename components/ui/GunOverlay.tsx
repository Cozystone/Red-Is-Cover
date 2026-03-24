'use client'

// GunOverlay — manages gun state display, shatter effect, and click handling
// GunCanvas (Three.js) is dynamically imported to prevent SSR errors

import { useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const GunCanvas = dynamic(() => import('./GunCanvas'), { ssr: false })

// ── Shatter effect ───────────────────────────────────────────────────────────

function runShatter(
  canvas: HTMLCanvasElement,
  originX: number,
  originY: number,
) {
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // ── Generate radial cracks ──
  const NUM = 14 + Math.floor(Math.random() * 6)
  const diag = Math.hypot(w, h)

  const cracks = Array.from({ length: NUM }, (_, i) => {
    const baseAngle = (i / NUM) * Math.PI * 2
    const jitter    = (Math.random() - 0.5) * (Math.PI / NUM) * 1.4
    const angle     = baseAngle + jitter
    const dist      = diag * (0.8 + Math.random() * 0.5)
    const dx        = Math.cos(angle) * dist
    const dy        = Math.sin(angle) * dist

    // 1-2 branch cracks off each primary crack
    const branches = Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => {
      const frac   = 0.25 + Math.random() * 0.45
      const bAngle = angle + (Math.random() - 0.5) * 1.0
      const bDist  = dist  * (0.35 + Math.random() * 0.4)
      return {
        fromFrac: frac,
        dx: Math.cos(bAngle) * bDist,
        dy: Math.sin(bAngle) * bDist,
      }
    })

    return { dx, dy, branches }
  })

  const start = performance.now()
  const TOTAL = 1300

  function frame(now: number) {
    const t = Math.min((now - start) / TOTAL, 1)
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'

    if (t < 0.5) {
      // ── Phase 1: cracks spread outward ──
      const p = t / 0.5   // 0 → 1

      // Darkening overlay
      ctx.fillStyle = `rgba(0,0,0,${p * 0.55})`
      ctx.fillRect(0, 0, w, h)

      for (const crack of cracks) {
        const ex = originX + crack.dx * p
        const ey = originY + crack.dy * p

        // Primary crack
        ctx.beginPath()
        ctx.moveTo(originX, originY)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = `rgba(255,255,255,${0.85 - p * 0.2})`
        ctx.lineWidth   = 1.8
        ctx.stroke()

        // Branches (start appearing at 40% of crack progress)
        if (p > 0.3) {
          const bp = (p - 0.3) / 0.7
          for (const b of crack.branches) {
            const bx0 = originX + crack.dx * b.fromFrac
            const by0 = originY + crack.dy * b.fromFrac
            ctx.beginPath()
            ctx.moveTo(bx0, by0)
            ctx.lineTo(bx0 + b.dx * bp, by0 + b.dy * bp)
            ctx.strokeStyle = `rgba(255,255,255,${0.55 - bp * 0.2})`
            ctx.lineWidth   = 0.9
            ctx.stroke()
          }
        }
      }

      // Origin glow (impact point)
      const r   = 80 * p
      const grd = ctx.createRadialGradient(originX, originY, 0, originX, originY, r)
      grd.addColorStop(0, `rgba(255,60,0,${0.9 * p})`)
      grd.addColorStop(0.4, `rgba(180,0,0,${0.4 * p})`)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(originX, originY, r, 0, Math.PI * 2)
      ctx.fill()

    } else {
      // ── Phase 2: white flash → red fade ──
      const p = (t - 0.5) / 0.5   // 0 → 1

      // Keep full cracks visible
      ctx.fillStyle = `rgba(0,0,0,${0.55 * (1 - p * 0.6)})`
      ctx.fillRect(0, 0, w, h)

      for (const crack of cracks) {
        ctx.beginPath()
        ctx.moveTo(originX, originY)
        ctx.lineTo(originX + crack.dx, originY + crack.dy)
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.65 - p * 0.65)})`
        ctx.lineWidth   = 1.8
        ctx.stroke()
      }

      // White flash (peaks at p ≈ 0.35)
      const flash = Math.sin(p * Math.PI) * 0.95
      ctx.fillStyle = `rgba(255,255,255,${flash})`
      ctx.fillRect(0, 0, w, h)

      // Deep red bleed in at end
      if (p > 0.55) {
        const rp = (p - 0.55) / 0.45
        ctx.fillStyle = `rgba(90,0,8,${rp * 0.97})`
        ctx.fillRect(0, 0, w, h)
      }
    }

    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GunOverlay() {
  const { gunState, shatterOrigin, grabGun, fireGun } = useGun()
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const didShatter   = useRef(false)

  // Trigger shatter animation when state changes to 'shattering'
  useEffect(() => {
    if (gunState !== 'shattering' || didShatter.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    didShatter.current = true
    runShatter(
      canvas,
      shatterOrigin.x * window.innerWidth,
      shatterOrigin.y * window.innerHeight,
    )
  }, [gunState, shatterOrigin])

  // Reset flag when returning to idle
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

  if (gunState === 'idle' || gunState === 'revealed') return null

  return (
    <>
      {/* ── 3D gun canvas ────────────────────────────────────────────────── */}
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
          <GunCanvas gunState={gunState} />

          {/* Hint text */}
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

      {/* ── Shatter canvas ────────────────────────────────────────────────── */}
      {gunState === 'shattering' && (
        <canvas
          ref={canvasRef}
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
