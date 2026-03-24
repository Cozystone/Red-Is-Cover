'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'

export default function Banner() {
  const ref = useRef<HTMLElement>(null)

  // ── Scroll-driven transforms ─────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Image parallax: moves up slower than scroll (depth illusion)
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  // Text floats forward — opposite direction, faster
  const textY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  // Slight 3D tilt on scroll
  const scrollRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -6])
  // Scale breathes in on enter
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.96, 1, 1, 0.96])
  // Overlay darkens slightly as image recedes
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 0.35, 0.55])

  // ── Mouse-driven 3D tilt ─────────────────────────────────────────────────
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const tiltX = useSpring(mouseY, { stiffness: 120, damping: 22 })
  const tiltY = useSpring(mouseX, { stiffness: 120, damping: 22 })

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x * 12)   // ±12° horizontal tilt
    mouseY.set(y * -8)   // ±8° vertical tilt
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Combine scroll + mouse tilt
  const rotateX = useTransform(
    [scrollRotateX, tiltX],
    ([s, m]: number[]) => s + m
  )

  return (
    <motion.section
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
        overflow: 'hidden',
        width: '100%',
        cursor: 'none',
      }}
    >
      {/* ── 3D stage ──────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          rotateX,
          rotateY: tiltY,
          scale,
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          height: 'clamp(260px, 38vw, 560px)',
          overflow: 'hidden',
          willChange: 'transform',
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        {/* ── LAYER 0: Image (slowest — furthest back) ─────────────────── */}
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-10% 0',
            backgroundImage: 'url(/banner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            y: imageY,
            transformOrigin: '50% 50%',
            willChange: 'transform',
          }}
        />

        {/* ── LAYER 1: Dark gradient overlay (depth) ───────────────────── */}
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.7) 100%)',
            opacity: overlayOpacity,
          }}
        />

        {/* ── LAYER 2: Grain texture (film aesthetic) ──────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            mixBlendMode: 'overlay',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* ── LAYER 3: Text block (fastest — closest to viewer) ────────── */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            y: textY,
            translateZ: '60px',
            pointerEvents: 'none',
            gap: '16px',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: 'clamp(8px, 1vw, 11px)',
              fontWeight: 500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Visual Statement — 2025
          </p>

          {/* Main title */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 5.5vw, 6rem)',
              fontWeight: 300,
              lineHeight: 1.05,
              color: '#FAF8F5',
              textAlign: 'center',
              letterSpacing: '-0.01em',
              textShadow: '0 4px 40px rgba(0,0,0,0.4)',
            }}
          >
            To The Ultimate Journey
          </h2>

          {/* Thin divider line */}
          <div
            style={{
              width: 'clamp(40px, 6vw, 80px)',
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </motion.div>

        {/* ── LAYER 4: Bottom edge label (window chrome) ───────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '32px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 'var(--page-margin)',
            paddingRight: 'var(--page-margin)',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            BANNER.001
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            ◆
          </p>
        </div>
      </motion.div>
    </motion.section>
  )
}
