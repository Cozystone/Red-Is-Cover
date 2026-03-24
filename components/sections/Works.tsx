'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: number
  title: string
  category: string
  year: string
  description: string
  placeholderBg: string
}

// ─── Project data ─────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    id: 1,
    title: 'The Weight of Objects',
    category: 'Visual Concept',
    year: '2024',
    description: 'Exploring what isolated objects reveal about absence and memory.',
    placeholderBg: '#C8D8E4',
  },
  {
    id: 2,
    title: 'Cold Sun',
    category: 'Editorial Direction',
    year: '2024',
    description: 'A study in pale light, empty landscape, and the geometry of loneliness.',
    placeholderBg: '#F5F0E8',
  },
  {
    id: 3,
    title: 'Telephone',
    category: 'Spatial Installation Concept',
    year: '2025',
    description: 'A single telephone in an empty room. Nobody calls. Someone was supposed to.',
    placeholderBg: 'rgba(154,154,154,0.2)',
  },
  {
    id: 4,
    title: 'Suit',
    category: 'Fashion Concept',
    year: '2025',
    description: 'What does a suit mean when there is no body inside it?',
    placeholderBg: 'rgba(200,216,228,0.6)',
  },
]

// ─── Directory Row ─────────────────────────────────────────────────────────────

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ backgroundColor: hovered ? 'rgba(10,10,10,0.03)' : 'transparent' }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr auto auto 24px',
        alignItems: 'center',
        gap: '24px',
        padding: '20px 0',
        borderBottom: '1px solid rgba(10,10,10,0.08)',
        cursor: 'pointer',
      }}
    >
      {/* Index */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: '#9A9A9A',
        }}
      >
        {String(index + 1).padStart(3, '0')}
      </span>

      {/* Title + description */}
      <div>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.25rem, 2.2vw, 2rem)',
            fontWeight: 300,
            color: '#0A0A0A',
            lineHeight: 1.2,
            marginBottom: hovered ? '6px' : '0',
            transition: 'margin 0.3s ease',
          }}
        >
          &ldquo;{project.title}&rdquo;
        </p>
        <motion.p
          animate={{ opacity: hovered ? 1 : 0, height: hovered ? 'auto' : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: '#9A9A9A',
            lineHeight: 1.6,
            overflow: 'hidden',
          }}
        >
          {project.description}
        </motion.p>
      </div>

      {/* Category */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9A9A9A',
          whiteSpace: 'nowrap',
        }}
      >
        {project.category}
      </span>

      {/* Year */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: '#9A9A9A',
          whiteSpace: 'nowrap',
        }}
      >
        {project.year}
      </span>

      {/* Arrow */}
      <motion.span
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
        transition={{ duration: 0.18 }}
        style={{ color: '#C41E1E', fontSize: '14px' }}
        aria-hidden="true"
      >
        →
      </motion.span>
    </motion.div>
  )
}

// ─── Works Section ────────────────────────────────────────────────────────────

export default function Works() {
  return (
    <section
      id="work"
      style={{
        backgroundColor: 'var(--color-ground, #FAF8F5)',
        paddingTop: 'clamp(96px, 12vw, 192px)',
        paddingBottom: 'clamp(96px, 12vw, 192px)',
        paddingLeft: 'var(--page-margin)',
        paddingRight: 'var(--page-margin)',
      }}
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <ScrollReveal variant="label" delay={0}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '64px',
            paddingBottom: '20px',
            borderBottom: '2px solid var(--color-void)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#9A9A9A',
              }}
            >
              01 — SELECTED WORKS
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: 300,
                color: '#0A0A0A',
                lineHeight: 1,
              }}
            >
              Chapters.
            </h2>
          </div>

          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: '#9A9A9A',
            }}
          >
            {projects.length} WORKS
          </span>
        </div>
      </ScrollReveal>

      {/* ── Directory listing ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(10,10,10,0.08)' }}>
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 0.08}>
            <ProjectRow project={project} index={i} />
          </ScrollReveal>
        ))}
      </div>

      {/* ── Footer label ───────────────────────────────────────────────── */}
      <ScrollReveal delay={0.3}>
        <div
          style={{
            marginTop: '48px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#9A9A9A',
            }}
          >
            More works in progress —
          </p>
        </div>
      </ScrollReveal>
    </section>
  )
}
