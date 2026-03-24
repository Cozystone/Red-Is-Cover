'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

// ─── Shared easing ───────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// ─── HeroObject ──────────────────────────────────────────────────────────────
// The symbolic hero object: fades in and scales up from 0.94 → 1.0
// Begins after 400ms of the page being ready.

interface HeroObjectProps {
  children: ReactNode
  className?: string
}

export function HeroObject({ children, className }: HeroObjectProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.4,
        delay: 0.4,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── HeroLabel ───────────────────────────────────────────────────────────────
// The small label text above / near the hero heading.
// Appears at 600ms, quick letter-spacing reveal.

interface HeroLabelProps {
  children: ReactNode
  className?: string
}

export function HeroLabel({ children, className }: HeroLabelProps) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, letterSpacing: '0.32em' }}
      animate={{ opacity: 1, letterSpacing: '0.18em' }}
      transition={{
        duration: 0.56,
        delay: 0.6,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.p>
  )
}

// ─── HeroStatement ───────────────────────────────────────────────────────────
// The main serif heading. Accepts children as an array of lines (strings or
// ReactNodes). Each line staggers in from below with 200ms between them,
// starting at 800ms total.

interface HeroStatementProps {
  /** Each element of this array is treated as one line */
  lines: ReactNode[]
  className?: string
  /** Additional className applied per line wrapper */
  lineClassName?: string
}

export function HeroStatement({ lines, className, lineClassName }: HeroStatementProps) {
  return (
    <div className={className} aria-label={typeof lines[0] === 'string' ? lines.join(' ') : undefined}>
      {lines.map((line, i) => (
        <div
          key={i}
          // Clip the overflow so the rising line appears from below the baseline
          style={{ overflow: 'hidden' }}
        >
          <motion.div
            className={lineClassName}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              // First line at 800ms, subsequent lines +200ms each
              delay: 0.8 + i * 0.2,
              ease: EASE_OUT_EXPO,
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  )
}

// ─── HeroScrollHint ──────────────────────────────────────────────────────────
// A subtle "scroll" indicator that appears last, at 1400ms.
// Fades in only — no movement, so it feels earned rather than noisy.

interface HeroScrollHintProps {
  children: ReactNode
  className?: string
}

export function HeroScrollHint({ children, className }: HeroScrollHintProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.56,
        delay: 1.4,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── HeroEntrance ─────────────────────────────────────────────────────────────
// The container orchestrator. The background fades in immediately at 0ms,
// establishing the stage before any content reveals.

interface HeroEntranceProps {
  children: ReactNode
  className?: string
}

export default function HeroEntrance({ children, className }: HeroEntranceProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: 0,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.section>
  )
}
