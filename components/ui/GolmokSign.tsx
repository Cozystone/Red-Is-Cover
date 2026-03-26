'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'

const LiquidOverlay  = dynamic(() => import('@/components/ui/LiquidOverlay'),  { ssr: false })
const WhiteRoomScene = dynamic(() => import('@/components/ui/WhiteRoomScene'), { ssr: false })

type GolmokPhase = 'idle' | 'clearing' | 'liquid' | 'transitioning' | 'whiteroom'

interface GolmokSignProps {
  phase: GolmokPhase
  onPhaseChange: (p: GolmokPhase) => void
}

export default function GolmokSign({ phase, onPhaseChange }: GolmokSignProps) {
  const setPhase = onPhaseChange
  const [mounted, setMounted] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { gunState } = useGun()

  // Only show click target when Landing is actually visible
  const isRevealed = gunState === 'revealed'

  useEffect(() => { setMounted(true) }, [])

  const handleClick = () => {
    if (phase !== 'idle') return
    // Go straight to liquid — GrassField stays visible underneath
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
      {/* ── Sign image — purely visual, pointerEvents none ──────────────────── */}
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
          style={{
            width:      'clamp(72px, 8.5vw, 118px)',
            height:     'auto',
            display:    'block',
            transition: 'filter 0.2s',
          }}
        />
      </div>

      {/* ── Portal click target — position:fixed, above all stacking contexts ─ */}
      {/* zIndex 700: above GunOverlay (610), below LiquidOverlay (9000)         */}
      {mounted && isRevealed && phase === 'idle' && createPortal(
        <div
          onClick={handleClick}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
          style={{
            position:        'fixed',
            right:           'clamp(22%, 29vw, 38%)',
            bottom:          'clamp(158px, 28vh, 300px)',
            zIndex:          700,
            width:           'clamp(112px, 13vw, 198px)',
            height:          'clamp(140px, 22vh, 260px)',
            cursor:          'pointer',
            backgroundColor: 'transparent',
          }}
        />,
        document.body
      )}

      {/* ── Liquid overlay ───────────────────────────────────────────────────── */}
      {phase === 'liquid' && (
        <LiquidOverlay onComplete={() => setPhase('transitioning')} />
      )}

      {/* ── White room ───────────────────────────────────────────────────────── */}
      {phase === 'whiteroom' && (
        <WhiteRoomScene onClose={() => setPhase('idle')} />
      )}
    </>
  )
}
