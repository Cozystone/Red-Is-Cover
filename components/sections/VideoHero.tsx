'use client'

/* VideoHero — fullscreen looping video with Red Is Cover title.
   When the gun is fired and gunState reaches 'revealed', this section
   transitions out (fades + subtle scale) to expose the Landing (red room)
   that was positioned behind it. */

import { useGun } from '@/lib/gunContext'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const CigaretteScene  = dynamic(() => import('@/components/ui/CigaretteScene'),  { ssr: false })
const WineGlassScene  = dynamic(() => import('@/components/ui/WineGlassScene'),  { ssr: false })

// ── Swipe/drag threshold (px) ──────────────────────────────────────────────────
const SWIPE_THRESHOLD = 50

export default function VideoHero() {
  const { gunState, curtainOpen, openCurtain } = useGun()
  const revealed = gunState === 'revealed' || gunState === 'shattering'

  const [wineMode, setWineMode] = useState(false)

  // ── Refs for gesture tracking ────────────────────────────────────────────────
  const touchStartX  = useRef<number | null>(null)
  const touchCount   = useRef(0)
  const rightDragX   = useRef<number | null>(null)
  const wheelAccum      = useRef(0)
  const wheelTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureLocked   = useRef(false)  // one toggle per continuous gesture

  useEffect(() => {
    document.body.style.overflow = curtainOpen ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [curtainOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !curtainOpen) {
        e.preventDefault()
        openCurtain()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [curtainOpen, openCurtain])

  // ── Gesture listeners (only active while curtain is closed) ──────────────────
  useEffect(() => {
    if (curtainOpen) return

    // ── Touch: two-finger horizontal swipe ──────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      touchCount.current = e.touches.length
      if (e.touches.length === 2) {
        touchStartX.current = (e.touches[0].clientX + e.touches[1].clientX) / 2
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchCount.current === 2 && touchStartX.current !== null) {
        const endX = e.changedTouches.length >= 2
          ? (e.changedTouches[0].clientX + e.changedTouches[1].clientX) / 2
          : e.changedTouches[0].clientX
        if (Math.abs(endX - touchStartX.current) > SWIPE_THRESHOLD) {
          setWineMode(m => !m)
        }
      }
      touchStartX.current = null
      touchCount.current  = 0
    }

    // ── Mouse: right-click + horizontal drag ─────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) rightDragX.current = e.clientX
    }
    const onMouseMove = (e: MouseEvent) => {
      // Detect during move so contextmenu doesn't interfere
      if (rightDragX.current !== null && (e.buttons & 2)) {
        if (Math.abs(e.clientX - rightDragX.current) > SWIPE_THRESHOLD) {
          rightDragX.current = null
          setWineMode(m => !m)
        }
      }
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) rightDragX.current = null
    }
    // Always prevent context menu on this site
    const onContextMenu = (e: MouseEvent) => { e.preventDefault() }

    // ── Trackpad: two-finger horizontal swipe → wheel deltaX ─────────────────────
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5) return
      e.preventDefault()

      wheelAccum.current += e.deltaX

      // Reset lock + accumulator when gesture ends (no events for 350ms)
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => {
        wheelAccum.current  = 0
        gestureLocked.current = false
      }, 350)

      // One toggle per gesture — lock until gesture ends
      if (!gestureLocked.current && Math.abs(wheelAccum.current) > 80) {
        gestureLocked.current = true
        wheelAccum.current    = 0
        setWineMode(m => !m)
      }
    }

    window.addEventListener('touchstart',   onTouchStart,  { passive: true })
    window.addEventListener('touchend',     onTouchEnd,    { passive: true })
    window.addEventListener('mousedown',    onMouseDown)
    window.addEventListener('mousemove',    onMouseMove)
    window.addEventListener('mouseup',      onMouseUp)
    window.addEventListener('contextmenu',  onContextMenu)
    window.addEventListener('wheel',        onWheel, { passive: false })

    return () => {
      window.removeEventListener('touchstart',   onTouchStart)
      window.removeEventListener('touchend',     onTouchEnd)
      window.removeEventListener('mousedown',    onMouseDown)
      window.removeEventListener('mousemove',    onMouseMove)
      window.removeEventListener('mouseup',      onMouseUp)
      window.removeEventListener('contextmenu',  onContextMenu)
      window.removeEventListener('wheel',        onWheel)
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
    }
  }, [curtainOpen])

  // Curtain and background color based on wineMode
  const curtainBg = wineMode ? '#ffffff' : '#000000'

  return (
    <section
      id="home"
      aria-label="Red Is Cover"
      style={{
        position:       'relative',
        width:          '100%',
        height:         '100%',
        overflow:       'hidden',
        backgroundColor: '#000',
        opacity:        revealed ? 0 : 1,
        transform:      revealed ? 'scale(1.04)' : 'scale(1)',
        transition:     revealed
          ? 'opacity 1.4s cubic-bezier(0.4,0,0.2,1) 0.6s, transform 1.6s cubic-bezier(0.4,0,0.2,1) 0.4s'
          : 'none',
        pointerEvents:  (revealed || curtainOpen) ? 'none' : 'auto',
      }}
    >
      {/* ── Looping background video ─────────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
        style={{
          position:       'absolute',
          inset:          0,
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'center',
          pointerEvents:  'none',
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
          background:    'radial-gradient(ellipse at 50% 80%, transparent 40%, rgba(0,0,0,0.18) 100%)',
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
          pointerEvents:   'none',
        }}
      />

      {/* ── "Red Is Cover" — sky area, upper center ──────────────────────── */}
      <div
        style={{
          position:      'absolute',
          top:           'clamp(90px, 18vh, 160px)',
          left:          0,
          right:         0,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          zIndex:        25,
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
            color:         '#FF2525',
            textTransform: 'uppercase',
            textShadow:    '0 0 40px rgba(200,0,26,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            margin:        0,
          }}
        >
          Red Is Cover
        </h1>
        <p
          style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontSize:      'clamp(13px, 1.6vw, 20px)',
            fontWeight:    700,
            fontStyle:     'italic',
            letterSpacing: '0.18em',
            color:         '#FF2525',
            marginTop:     '10px',
            textAlign:     'center',
          }}
        >
          Anseok Kim&rsquo;s Portfolio
        </p>
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
          pointerEvents: 'none',
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

      {/* ── 3D scenes — both mounted, crossfade via opacity ──────────────── */}
      {!curtainOpen && (
        <>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 22,
            opacity: wineMode ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}>
            <CigaretteScene visible={true} />
          </div>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 22,
            opacity: wineMode ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}>
            <WineGlassScene visible={true} />
          </div>
        </>
      )}

      {/* ── Curtain — left panel ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          right:           '50%',
          backgroundColor: curtainBg,
          zIndex:          20,
          transform:       curtainOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition:      curtainOpen
            ? 'transform 2.2s cubic-bezier(0.76,0,0.24,1)'
            : 'background-color 0.6s ease',
        }}
      />

      {/* ── Curtain — right panel ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          left:            '50%',
          backgroundColor: curtainBg,
          zIndex:          20,
          transform:       curtainOpen ? 'translateX(100%)' : 'translateX(0)',
          transition:      curtainOpen
            ? 'transform 2.2s cubic-bezier(0.76,0,0.24,1)'
            : 'background-color 0.6s ease',
        }}
      />

      {/* ── Tap/Space hint ───────────────────────────────────────────────── */}
      {!curtainOpen && (
        <div
          onClick={openCurtain}
          style={{
            position:      'absolute',
            inset:         0,
            zIndex:        27,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'flex-end',
            paddingBottom: 'clamp(28px, 5vh, 48px)',
            cursor:        'pointer',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '10px',
              animation:     'hintPulse 2.4s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
                fontSize:      '9px',
                fontWeight:    500,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color:         wineMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
              }}
              className="hint-space"
            >
              Press Space
            </span>
            <span
              style={{
                fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
                fontSize:      '9px',
                fontWeight:    500,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color:         wineMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)',
                display:       'none',
              }}
              className="hint-tap"
            >
              Tap to enter
            </span>
            <div
              className="hint-key"
              style={{
                width:        '28px',
                height:       '16px',
                border:       `1px solid ${wineMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Swipe hint — right center ────────────────────────────────────── */}
      {!curtainOpen && (
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            right:         'clamp(18px, 3vw, 36px)',
            top:           '50%',
            transform:     'translateY(-50%)',
            zIndex:        27,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '8px',
            pointerEvents: 'none',
            userSelect:    'none',
            animation:     'hintPulse 2.8s ease-in-out infinite',
            animationDelay: '1s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              display:       'inline-block',
              animation:     'swipeLeft 1.8s ease-in-out infinite',
              fontSize:      '14px',
              color:         wineMode ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)',
            }}>←</span>
            <span style={{
              display:       'inline-block',
              animation:     'swipeRight 1.8s ease-in-out infinite',
              fontSize:      '14px',
              color:         wineMode ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)',
            }}>→</span>
          </div>
          <span style={{
            fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
            fontSize:      '8px',
            fontWeight:    500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         wineMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
          }}>Swipe</span>
        </div>
      )}

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(0.6); }
        }
        @keyframes hintPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes swipeLeft {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(-4px); }
        }
        @keyframes swipeRight {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(4px); }
        }
        @media (hover: none) and (pointer: coarse) {
          .hint-space { display: none !important; }
          .hint-tap   { display: block !important; }
          .hint-key   { display: none !important; }
        }
      `}</style>
    </section>
  )
}
