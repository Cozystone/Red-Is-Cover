'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const LiquidOverlay  = dynamic(() => import('@/components/ui/LiquidOverlay'),  { ssr: false })
const WhiteRoomScene = dynamic(() => import('@/components/ui/WhiteRoomScene'), { ssr: false })
const PhoneCallScene = dynamic(() => import('@/components/ui/PhoneCallScene'), { ssr: false })

type GolmokPhase = 'idle' | 'clearing' | 'liquid' | 'transitioning' | 'whiteroom' | 'phonecall'

interface CapturedPhoto {
  zoom: number
  pan: { x: number; y: number }
}

interface GolmokSignProps {
  phase: GolmokPhase
  onPhaseChange: (p: GolmokPhase) => void
}

// ── Polaroid photo ─────────────────────────────────────────────────────────

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='0.18'/%3E%3C/svg%3E")`

function PolaroidPhoto({ photo, onDismiss }: { photo: CapturedPhoto; onDismiss: () => void }) {
  return createPortal(
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        bottom: 'clamp(70px, 16vh, 180px)',
        right:  'clamp(32px, 5vw, 80px)',
        zIndex: 20,
        animation: 'polaroidDrop 0.75s cubic-bezier(0.22,1,0.36,1) forwards',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Thumbtack pin */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-10px', left: '50%',
        transform: 'translateX(-50%)',
        width: '14px', height: '14px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ff7755, #cc2200)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.18)',
        zIndex: 1,
      }} />

      {/* Polaroid frame */}
      <div style={{
        background: '#f8f6f2',
        padding: '7px 7px 34px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.3)',
        width: 'clamp(130px, 15vw, 196px)',
        transform: 'rotate(-3.5deg)',
      }}>
        {/* Photo */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden' }}>
          {/* Base image with viewfinder transform applied */}
          <div style={{
            position: 'absolute',
            inset: '-50%',
            backgroundImage: 'url(/seoul-night.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${photo.zoom}) translate(${photo.pan.x / photo.zoom}px, ${photo.pan.y / photo.zoom}px)`,
            filter: 'brightness(0.62) contrast(1.22) saturate(1.6)',
          }} />
          {/* Film grain */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: GRAIN_SVG,
            opacity: 0.8, mixBlendMode: 'overlay',
          }} />
          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.58) 100%)',
          }} />
        </div>

        {/* Polaroid caption area */}
        <div style={{
          marginTop: '8px', paddingLeft: '3px',
          fontFamily: 'monospace', fontSize: '5.5px',
          color: 'rgba(0,0,0,0.22)', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          SEOUL · 2026
        </div>
      </div>

      <style>{`
        @keyframes polaroidDrop {
          0%   { opacity: 0; transform: translateY(-28px) scale(0.86); }
          55%  { opacity: 1; transform: translateY(5px)  scale(1.03); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function GolmokSign({ phase, onPhaseChange }: GolmokSignProps) {
  const setPhase = onPhaseChange
  const [mounted, setMounted] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { gunState } = useGun()

  const isRevealed = gunState === 'revealed'

  useEffect(() => {
    setMounted(true)
    import('@/components/ui/WhiteRoomScene')
    import('@/components/ui/PhoneCallScene')
  }, [])

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('liquid')
  }

  const handleHoverIn = () => {
    if (imgRef.current)
      imgRef.current.style.filter = 'brightness(1.15) drop-shadow(0 0 8px rgba(240,220,140,0.7))'
  }
  const handleHoverOut = () => {
    if (imgRef.current) imgRef.current.style.filter = 'brightness(1)'
  }

  return (
    <>
      {/* ── Sign image ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 'clamp(22%, 29vw, 38%)', bottom: 'clamp(158px, 28vh, 300px)',
        zIndex: 6, pointerEvents: 'none', userSelect: 'none',
      }}>
        <img ref={imgRef} src="/golmok-sign.png" alt="골목길"
          style={{ width: 'clamp(72px, 8.5vw, 118px)', height: 'auto', display: 'block', transition: 'filter 0.2s' }}
        />
      </div>

      {/* ── Portal click target ─────────────────────────────────────────────── */}
      {mounted && isRevealed && phase === 'idle' && createPortal(
        <div onClick={handleClick} onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}
          style={{
            position: 'fixed', right: 'clamp(22%, 29vw, 38%)', bottom: 'clamp(158px, 28vh, 300px)',
            zIndex: 700, width: 'clamp(112px, 13vw, 198px)', height: 'clamp(140px, 22vh, 260px)',
            cursor: 'pointer', backgroundColor: 'transparent',
          }}
        />,
        document.body
      )}

      {/* ── Liquid overlay ──────────────────────────────────────────────────── */}
      {phase === 'liquid' && (
        <LiquidOverlay onComplete={() => setPhase('transitioning')} />
      )}

      {/* ── White cover (prevents flash between phases) ──────────────────── */}
      {mounted && (phase === 'whiteroom' || phase === 'phonecall') && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: '#f8f8f6', zIndex: 9000 }} />,
        document.body
      )}

      {/* ── White room ──────────────────────────────────────────────────────── */}
      {phase === 'whiteroom' && (
        <WhiteRoomScene
          onClose={() => setPhase('idle')}
          onPhoneClick={() => setPhase('phonecall')}
        />
      )}

      {/* ── Phone call scene ────────────────────────────────────────────────── */}
      {phase === 'phonecall' && (
        <PhoneCallScene onClose={(photo) => {
          if (photo) setCapturedPhoto(photo)
          setPhase('idle')
        }} />
      )}

      {/* ── Polaroid photo — appears after capture ───────────────────────── */}
      {mounted && phase === 'idle' && capturedPhoto && (
        <PolaroidPhoto photo={capturedPhoto} onDismiss={() => setCapturedPhoto(null)} />
      )}
    </>
  )
}
