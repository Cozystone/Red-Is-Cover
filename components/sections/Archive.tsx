'use client'

/* Archive Section — visual archive / object language */
/* cream background, banner.png, parallax, object tag grid, ticker */

import Image from 'next/image'
import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Constants ────────────────────────────────────────────────────────────────

const OBJECT_TAGS = [
  'FLOWER',
  'SUIT',
  'TELEPHONE',
  'FIRE',
  'CHAIR',
  'CHANDELIER',
  'RIBBON',
  'LETTER',
  'BALLOON',
  'CAR',
  'TABLE',
  'OLD MUSIC DEVICE',
] as const

const TICKER_LABELS = [
  'FLOWER',
  'SUIT',
  'TELEPHONE',
  'FIRE',
  'CHAIR',
  'CHANDELIER',
  'RIBBON',
  'LETTER',
  'BALLOON',
  'CAR',
  'TABLE',
  'OLD MUSIC DEVICE',
] as const

// ─── Object Tag ───────────────────────────────────────────────────────────────

function ObjectTag({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        backgroundColor: hovered ? '#D91C1C' : 'transparent',
        color: hovered ? '#FAF8F5' : '#060606',
        borderColor: hovered ? '#D91C1C' : 'rgba(6,6,6,0.2)',
      }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'inline-block',
        border: '1px solid rgba(6,6,6,0.2)',
        padding: '6px 16px',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        cursor: 'default',
        userSelect: 'none' as const,
      }}
    >
      {label}
    </motion.span>
  )
}

// ─── Archive Section ──────────────────────────────────────────────────────────

export default function Archive() {
  const bannerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start end', 'end start'],
  })

  // Parallax: image moves up slightly as user scrolls past
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section
      id="archive"
      aria-label="Visual Archive"
      style={{ backgroundColor: '#F2EDE3', overflow: 'hidden' }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1 — Section header
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          paddingTop: 'clamp(96px, 12vw, 192px)',
          paddingLeft: 'var(--page-margin)',
          paddingRight: 'var(--page-margin)',
          paddingBottom: 'clamp(48px, 6vw, 80px)',
        }}
      >
        <ScrollReveal variant="label" delay={0.05}>
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#D91C1C',
              marginBottom: '32px',
            }}
          >
            04 — VISUAL ARCHIVE
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.8rem, 7vw, 7rem)',
              fontWeight: 300,
              color: '#060606',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
            }}
          >
            A vocabulary
            <br />
            made of things.
          </h2>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2 — Banner image with parallax
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={bannerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(300px, 35vw, 500px)',
          overflow: 'hidden',
        }}
      >
        {/* Parallax image wrapper */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '-10%',
            y: imageY,
          }}
        >
          <Image
            src="/banner.png"
            alt="Dramatic figure on mountain — visual archive"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
            priority
          />
        </motion.div>

        {/* Dark gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(6,6,6,0.55) 0%, rgba(6,6,6,0.2) 50%, rgba(6,6,6,0.4) 100%)',
            zIndex: 2,
          }}
        />

        {/* Text overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 'var(--page-margin)',
            paddingRight: 'var(--page-margin)',
            zIndex: 3,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.5rem, 3.5vw, 3.5rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#FAF8F5',
              lineHeight: 1.2,
              maxWidth: '18em',
              letterSpacing: '0.01em',
            }}
          >
            To The Ultimate Journey
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 3 — Object Language tag grid
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          paddingTop: 'clamp(56px, 7vw, 96px)',
          paddingBottom: 'clamp(48px, 6vw, 80px)',
          paddingLeft: 'var(--page-margin)',
          paddingRight: 'var(--page-margin)',
        }}
      >
        <ScrollReveal variant="label" delay={0.05}>
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
              marginBottom: '24px',
            }}
          >
            OBJECT LANGUAGE — A RECURRING VOCABULARY
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {OBJECT_TAGS.map((tag) => (
              <ObjectTag key={tag} label={tag} />
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 4 — Two-column editorial
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          paddingLeft: 'var(--page-margin)',
          paddingRight: 'var(--page-margin)',
          paddingBottom: 'clamp(64px, 8vw, 96px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)',
            alignItems: 'start',
          }}
        >
          {/* Left — 5 cols */}
          <div
            style={{
              gridColumn: 'span 12',
            }}
            className="archive-col-left"
          >
            <ScrollReveal delay={0.08}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: '#060606',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                Things that carry
                <br />
                warmth.
              </p>
            </ScrollReveal>
          </div>

          {/* Right — offset column */}
          <div
            style={{
              gridColumn: 'span 12',
            }}
            className="archive-col-right"
          >
            <ScrollReveal delay={0.18}>
              <p
                style={{
                  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: 1.85,
                  color: '#8A8A8A',
                  maxWidth: '52ch',
                }}
              >
                Every object in my work is chosen for what it implies, not what
                it shows. The telephone suggests waiting. The suit suggests
                absence. The flower suggests what is already ending.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Concluding — Red bar + Ticker
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Thick red bar */}
      <div
        aria-hidden="true"
        style={{
          height: '3px',
          width: '100%',
          backgroundColor: '#D91C1C',
        }}
      />

      {/* Slow-drifting ticker */}
      <div
        style={{
          paddingTop: '28px',
          paddingBottom: '28px',
          overflow: 'hidden',
          borderTop: '1px solid rgba(6,6,6,0.06)',
        }}
      >
        <motion.div
          className="flex items-center whitespace-nowrap"
          animate={{ x: [0, -640] }}
          transition={{
            duration: 60,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {[...TICKER_LABELS, ...TICKER_LABELS, ...TICKER_LABELS].map((label, i) => (
            <span key={`${label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                  fontSize: '10px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.18em',
                  color: '#8A8A8A',
                  padding: '0 2.5rem',
                }}
              >
                {label}
              </span>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '1px',
                  height: '12px',
                  backgroundColor: 'rgba(6,6,6,0.15)',
                  flexShrink: 0,
                }}
              />
            </span>
          ))}
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .archive-col-left {
            grid-column: span 5 !important;
          }
          .archive-col-right {
            grid-column: 8 / span 5 !important;
          }
        }
      `}</style>
    </section>
  )
}
