'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: number
  title: string
  category: string
  year: string
  description: string
  /** Tailwind background class for the placeholder image area */
  placeholderBg: string
  /** If true, this card renders as a full-width horizontal layout */
  isWide?: boolean
}

// ─── Project data ─────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    id: 1,
    title: 'The Weight of Objects',
    category: 'Visual Concept',
    year: '2024',
    description:
      'Exploring what isolated objects reveal about absence and memory.',
    placeholderBg: 'bg-[#C8D8E4]',
  },
  {
    id: 2,
    title: 'Cold Sun',
    category: 'Editorial Direction',
    year: '2024',
    description:
      'A study in pale light, empty landscape, and the geometry of loneliness.',
    placeholderBg: 'bg-[#F5F0E8]',
  },
  {
    id: 3,
    title: 'Telephone',
    category: 'Spatial Installation Concept',
    year: '2025',
    description:
      'A single telephone in an empty room. Nobody calls. Someone was supposed to.',
    placeholderBg: 'bg-[#9A9A9A]/20',
    isWide: true,
  },
  {
    id: 4,
    title: 'Suit',
    category: 'Fashion Concept',
    year: '2025',
    description:
      'What does a suit mean when there is no body inside it?',
    placeholderBg: 'bg-[#C8D8E4]/60',
  },
]

// ─── Card Components ──────────────────────────────────────────────────────────

function ProjectArrow() {
  return (
    <AnimatePresence>
      <motion.span
        key="arrow"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ color: '#C41E1E' }}
        className="inline-block ml-2 text-sm"
        aria-hidden="true"
      >
        →
      </motion.span>
    </AnimatePresence>
  )
}

interface StandardCardProps {
  project: Project
  /** Column offset applied to col-2 cards */
  offset?: boolean
}

function StandardCard({ project, offset }: StandardCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cursor-hover group"
      style={{ marginTop: offset ? '96px' : '0px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image placeholder */}
      <div className="overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <motion.div
          className={`w-full h-full ${project.placeholderBg}`}
          animate={{
            scale: hovered ? 1.02 : 1,
            filter: hovered ? 'saturate(1)' : 'saturate(0.7)',
          }}
          transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Meta */}
      <div className="mt-4 space-y-1">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#9A9A9A', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}
        >
          {project.category}
        </p>

        <div className="flex items-baseline">
          <h3
            className="text-xl font-light leading-snug"
            style={{ fontFamily: 'var(--font-serif, Cormorant Garamond, serif)', color: '#0A0A0A' }}
          >
            {project.title}
          </h3>
          {hovered && <ProjectArrow />}
        </div>

        <p
          className="text-xs"
          style={{ color: '#9A9A9A', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}
        >
          {project.year}
        </p>
      </div>
    </div>
  )
}

interface WideCardProps {
  project: Project
}

function WideCard({ project }: WideCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cursor-hover col-span-2 grid grid-cols-12 gap-6 items-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image: spans 6 columns */}
      <div className="col-span-6 overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <motion.div
          className={`w-full h-full ${project.placeholderBg}`}
          animate={{
            scale: hovered ? 1.02 : 1,
            filter: hovered ? 'saturate(1)' : 'saturate(0.7)',
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Text: spans 5 columns, offset by 1 */}
      <div className="col-span-5 col-start-8 flex flex-col justify-end h-full pt-8 space-y-3">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#9A9A9A', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}
        >
          {project.category}
        </p>

        <div className="flex items-baseline">
          <h3
            className="font-light leading-tight"
            style={{
              fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
              color: '#0A0A0A',
              fontSize: 'clamp(1.75rem, 3vw, 3rem)',
            }}
          >
            {project.title}
          </h3>
          {hovered && <ProjectArrow />}
        </div>

        <p
          className="text-sm leading-relaxed"
          style={{ color: '#9A9A9A', fontFamily: 'var(--font-sans, DM Sans, sans-serif)', maxWidth: '36ch' }}
        >
          {project.description}
        </p>

        <p
          className="text-xs"
          style={{ color: '#9A9A9A', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}
        >
          {project.year}
        </p>
      </div>
    </div>
  )
}

// ─── Works Section ────────────────────────────────────────────────────────────

export default function Works() {
  // Separate wide cards from standard cards
  const standardProjects = projects.filter((p) => !p.isWide)
  const wideProjects = projects.filter((p) => p.isWide)

  // Split standard projects into two columns (col 1: even indices, col 2: odd)
  const col1 = standardProjects.filter((_, i) => i % 2 === 0)
  const col2 = standardProjects.filter((_, i) => i % 2 === 1)

  // For stagger delay: map project id → global card index
  const delayMap: Record<number, number> = {}
  let idx = 0
  standardProjects.forEach((p) => { delayMap[p.id] = idx; idx++ })
  wideProjects.forEach((p) => { delayMap[p.id] = idx; idx++ })

  return (
    <section
      className="w-full py-32 px-6 md:px-12 lg:px-20"
      style={{ backgroundColor: 'var(--color-ground, #FAF8F5)' }}
    >
      {/* Section label */}
      <ScrollReveal variant="label" delay={0}>
        <p
          className="text-xs uppercase mb-3"
          style={{
            color: '#9A9A9A',
            fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
            letterSpacing: '0.18em',
          }}
        >
          Selected Works
        </p>
      </ScrollReveal>

      {/* Section heading */}
      <ScrollReveal delay={0.08}>
        <h2
          className="font-light leading-none mb-20"
          style={{
            fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
            fontSize: 'clamp(3rem, 8vw, 8vw)',
            color: '#0A0A0A',
          }}
        >
          Chapters.
        </h2>
      </ScrollReveal>

      {/* Two-column staggered grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-16">
        {/* Column 1 — no offset */}
        <div className="flex flex-col gap-16">
          {col1.map((project) => (
            <ScrollReveal
              key={project.id}
              delay={delayMap[project.id] * 0.1}
              variant="image"
            >
              <StandardCard project={project} offset={false} />
            </ScrollReveal>
          ))}
        </div>

        {/* Column 2 — offset down by 96px via StandardCard prop */}
        <div className="flex flex-col gap-16">
          {col2.map((project) => (
            <ScrollReveal
              key={project.id}
              delay={delayMap[project.id] * 0.1}
              variant="image"
            >
              <StandardCard project={project} offset={true} />
            </ScrollReveal>
          ))}
        </div>

        {/* Wide cards — full width, spanning both columns */}
        {wideProjects.map((project) => (
          <ScrollReveal
            key={project.id}
            delay={delayMap[project.id] * 0.1}
            variant="image"
            className="col-span-2"
          >
            <WideCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
