'use client'

import { useState } from 'react'

export default function GolmokSign() {
  const [phase, setPhase] = useState<'idle' | 'flash' | 'alley' | 'fadeout'>('idle')

  const handleClick = () => {
    if (phase !== 'idle') return

    // 1. White flash (light brightening)
    setPhase('flash')
    setTimeout(() => {
      // 2. Show alley photo full screen
      setPhase('alley')
      setTimeout(() => {
        // 3. Fade out back to grass
        setPhase('fadeout')
        setTimeout(() => setPhase('idle'), 900)
      }, 3200)
    }, 600)
  }

  return (
    <>
      {/* ── Sign image ─────────────────────────────────────────────────────── */}
      {/* Hit area: 40px padding all sides, offset compensated so sign stays in place */}
      <div
        onClick={handleClick}
        style={{
          position:   'absolute',
          right:      'calc(clamp(22%, 29vw, 38%) - 40px)',
          bottom:     'calc(clamp(158px, 28vh, 300px) - 40px)',
          zIndex:     6,
          cursor:     'pointer',
          userSelect: 'none',
          padding:    '40px',
        }}
        onMouseEnter={e => {
          const img = e.currentTarget.querySelector('img') as HTMLElement
          if (img) img.style.filter = 'brightness(1.15) drop-shadow(0 0 8px rgba(240,220,140,0.7))'
        }}
        onMouseLeave={e => {
          const img = e.currentTarget.querySelector('img') as HTMLElement
          if (img) img.style.filter = phase === 'idle' ? 'brightness(1)' : 'brightness(1.4)'
        }}
      >
        <img
          src="/golmok-sign.png"
          alt="골목길"
          style={{
            width:      'clamp(72px, 8.5vw, 118px)',
            height:     'auto',
            display:    'block',
            transition: 'filter 0.2s',
            filter:     phase === 'idle' ? 'brightness(1)' : 'brightness(1.4)',
          }}
        />
      </div>

      {/* ── White flash overlay ─────────────────────────────────────────────── */}
      {phase === 'flash' && (
        <div
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        9000,
            background:    'white',
            animation:     'golmokFlash 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Alley fullscreen ───────────────────────────────────────────────── */}
      {(phase === 'alley' || phase === 'fadeout') && (
        <div
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     8999,
            background: '#000',
            opacity:    phase === 'fadeout' ? 0 : 1,
            transition: phase === 'fadeout' ? 'opacity 0.9s ease-in-out' : 'opacity 0.4s ease-out',
            cursor:     'pointer',
          }}
          onClick={() => {
            if (phase === 'alley') {
              setPhase('fadeout')
              setTimeout(() => setPhase('idle'), 900)
            }
          }}
        >
          <img
            src="/golmok-alley.jpg"
            alt=""
            style={{
              width:          '100%',
              height:         '100%',
              objectFit:      'cover',
              objectPosition: 'center',
              display:        'block',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes golmokFlash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  )
}
