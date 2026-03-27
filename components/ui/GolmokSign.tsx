'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const LiquidOverlay  = dynamic(() => import('@/components/ui/LiquidOverlay'),  { ssr: false })
const WhiteRoomScene = dynamic(() => import('@/components/ui/WhiteRoomScene'), { ssr: false })
const PhoneCallScene = dynamic(() => import('@/components/ui/PhoneCallScene'), { ssr: false })

type GolmokPhase = 'idle' | 'clearing' | 'liquid' | 'transitioning' | 'whiteroom' | 'phonecall'

interface GolmokSignProps {
  phase: GolmokPhase
  onPhaseChange: (p: GolmokPhase) => void
}

export default function GolmokSign({ phase, onPhaseChange }: GolmokSignProps) {
  const setPhase = onPhaseChange
  const [mounted, setMounted] = useState(false)
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
      <div
        style={{
          position:      'absolute',
          right:         'clamp(22%, 29vw, 38%)',
          bottom:        'clamp(158px, 28vh, 300px)',
          zIndex:        6,
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >
        <img
          ref={imgRef}
          src="/golmok-sign.png"
          alt="골목길"
          style={{ width: 'clamp(72px, 8.5vw, 118px)', height: 'auto', display: 'block', transition: 'filter 0.2s' }}
        />
      </div>

      {/* ── Portal click target ─────────────────────────────────────────────── */}
      {mounted && isRevealed && phase === 'idle' && createPortal(
        <div
          onClick={handleClick}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
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
        <PhoneCallScene onClose={() => setPhase('idle')} />
      )}
    </>
  )
}
