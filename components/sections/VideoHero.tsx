'use client'

/* VideoHero — fullscreen looping video with Red Is Cover title.
   When the gun is fired and gunState reaches 'revealed', this section
   transitions out (fades + subtle scale) to expose the Landing (red room)
   that was positioned behind it. */

import { useGun } from '@/lib/gunContext'

export default function VideoHero() {
  const { gunState } = useGun()
  const revealed = gunState === 'revealed' || gunState === 'shattering'

  return (
    <section
      id="home"
      aria-label="Red Is Cover"
      style={{
        position:       'relative',
        width:          '100%',
        height:         '100%',       // fills parent absolute container
        overflow:       'hidden',
        backgroundColor: '#000',
        // Fade out when gun reveals the Landing behind it
        opacity:        revealed ? 0 : 1,
        transform:      revealed ? 'scale(1.04)' : 'scale(1)',
        transition:     revealed
          ? 'opacity 1.4s cubic-bezier(0.4,0,0.2,1) 0.6s, transform 1.6s cubic-bezier(0.4,0,0.2,1) 0.4s'
          : 'none',
        pointerEvents:  revealed ? 'none' : 'auto',
      }}
    >
      {/* ── Looping background video ─────────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        style={{
          position:       'absolute',
          inset:          0,
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'center',
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* ── Subtle dark vignette overlay ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Top-left thin red bar ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          top:             0,
          left:            0,
          width:           '6px',
          height:          '100%',
          backgroundColor: '#C8001A',
          zIndex:          10,
        }}
      />

      {/* ── "Red Is Cover" — sky area, upper center ──────────────────────── */}
      <div
        style={{
          position:      'absolute',
          top:           'clamp(60px, 12vh, 120px)',
          left:          0,
          right:         0,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          zIndex:        5,
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >
        <h1
          style={{
            fontFamily:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize:      'clamp(42px, 7.5vw, 110px)',
            fontWeight:    700,
            letterSpacing: '-0.03em',
            lineHeight:    1.0,
            color:         '#C8001A',
            textTransform: 'uppercase',
            textShadow:    '0 0 60px rgba(0,0,0,0.25), 0 2px 12px rgba(0,0,0,0.35)',
            margin:        0,
          }}
        >
          Red Is Cover
        </h1>
      </div>

      {/* ── Scroll hint — bottom center ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'clamp(28px, 5vh, 48px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           '8px',
          zIndex:        5,
          opacity:       0.6,
        }}
      >
        <span
          style={{
            fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
            fontSize:      '9px',
            fontWeight:    500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         'white',
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width:           '1px',
            height:          '40px',
            backgroundColor: 'white',
            animation:       'scrollPulse 2s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(0.6); }
        }
      `}</style>
    </section>
  )
}
