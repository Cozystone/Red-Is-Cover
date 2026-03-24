'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const OBJECT_WORDS = [
  'flowers',
  'fire',
  'ribbons',
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
] as const

// Accent colors for object word hover
const WORD_ACCENT_COLORS: Record<string, string> = {
  flowers: '#C8D8E4',
  fire: '#C41E1E',
  ribbons: '#F5F0E8',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ObjectWordProps {
  word: string
}

function ObjectWord({ word }: ObjectWordProps) {
  const [hovered, setHovered] = useState(false)
  const accentColor = WORD_ACCENT_COLORS[word] ?? '#9A9A9A'

  return (
    <motion.span
      className="cursor-hover inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ color: hovered ? accentColor : '#9A9A9A' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        display: 'inline-block',
      }}
    >
      [{word}]
    </motion.span>
  )
}

// ─── Archive Section ──────────────────────────────────────────────────────────

export default function Archive() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-cream, #F5F0E8)' }}
    >
      {/* ── Section label ─────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 lg:px-20 pt-32">
        <ScrollReveal variant="label" delay={0.1}>
          <p
            className="text-xs uppercase mb-16"
            style={{
              color: '#9A9A9A',
              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
              letterSpacing: '0.18em',
            }}
          >
            Visual Archive
          </p>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1 — Full-width text statement + object words
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 md:px-12 lg:px-20 pb-24 text-center">
        <ScrollReveal delay={0.15}>
          <h2
            className="font-light leading-none mb-10"
            style={{
              fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
              fontSize: 'clamp(2.5rem, 6vw, 6vw)',
              color: '#0A0A0A',
              fontStyle: 'italic',
            }}
          >
            Things that carry warmth.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-center gap-8">
            {OBJECT_WORDS.map((word) => (
              <ObjectWord key={word} word={word} />
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2 — Asymmetric 3-column layout
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 md:px-12 lg:px-20 pb-32">
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Left: tall placeholder image, 3 cols, aspect 3:4 */}
          <div className="col-span-12 md:col-span-3">
            <ScrollReveal variant="image" delay={0.1}>
              <div
                className="w-full"
                style={{
                  aspectRatio: '3/4',
                  backgroundColor: 'rgba(200, 216, 228, 0.4)',
                }}
              />
            </ScrollReveal>
          </div>

          {/* Center: large object word + caption, 6 cols */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-center py-8 md:py-0 md:pl-8">
            <ScrollReveal delay={0.2}>
              <p
                className="font-light leading-none mb-6"
                style={{
                  fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
                  fontSize: 'clamp(4rem, 12vw, 12vw)',
                  color: '#0A0A0A',
                  letterSpacing: '-0.02em',
                }}
              >
                CHAIR
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.32}>
              <p
                className="text-base font-light italic"
                style={{
                  fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
                  color: '#9A9A9A',
                  maxWidth: '28ch',
                }}
              >
                It waited. No one came.
              </p>
            </ScrollReveal>
          </div>

          {/* Right: square placeholder image, 3 cols */}
          <div className="col-span-12 md:col-span-3">
            <ScrollReveal variant="image" delay={0.18}>
              <div
                className="w-full"
                style={{
                  aspectRatio: '1/1',
                  backgroundColor: 'var(--color-cream, #F5F0E8)',
                  border: '1px solid rgba(154,154,154,0.2)',
                }}
              />
            </ScrollReveal>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 3 — Object ticker
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="py-10 border-y"
        style={{ borderColor: 'rgba(154,154,154,0.2)' }}
      >
        <ScrollReveal delay={0.05}>
          {/* Outer clip container — hides overflow for a clean edge */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center whitespace-nowrap"
              animate={{ x: [0, -80] }}
              transition={{
                duration: 60,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              {/* Duplicate labels twice so the loop appears seamless */}
              {[...TICKER_LABELS, ...TICKER_LABELS].map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="inline-flex items-center"
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: '#9A9A9A',
                      padding: '0 2.5rem',
                    }}
                  >
                    {label}
                  </span>
                  {/* Separator dash */}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '1px',
                      height: '12px',
                      backgroundColor: 'rgba(154,154,154,0.4)',
                      flexShrink: 0,
                    }}
                  />
                </span>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Concluding text block
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-3xl">
          <ScrollReveal delay={0.1}>
            <p
              className="font-light italic leading-snug mb-8"
              style={{
                fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
                fontSize: 'clamp(1.75rem, 3.5vw, 3.5vw)',
                color: '#0A0A0A',
              }}
            >
              A vocabulary made of things.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.22}>
            <p
              className="text-sm leading-loose"
              style={{
                fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                color: '#9A9A9A',
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
    </section>
  )
}
