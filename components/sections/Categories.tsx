'use client'

/* Categories Section — replaces Works.tsx */
/* Category gateway system with popup trigger */

import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  title: string
  status: 'in_progress' | 'upcoming' | 'completed' | 'archived'
  category: 'art' | 'fashion' | 'brand' | 'writing' | 'worldbuilding'
  description: string
  concept: string
  year: string
  tags?: string[]
}

interface Category {
  key: string
  label: string
  number: string
  color: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'The Weight of Objects',
    status: 'completed',
    category: 'art',
    description: 'What isolated objects reveal about absence and memory.',
    concept: 'When an object is placed in an empty space, it stops being functional and starts being symbolic.',
    year: '2024',
    tags: ['visual', 'object', 'memory'],
  },
  {
    id: '2',
    title: 'Cold Sun',
    status: 'completed',
    category: 'art',
    description: 'Pale light, empty landscape, and the geometry of loneliness.',
    concept: 'A study in the emotional temperature of natural light.',
    year: '2024',
    tags: ['editorial', 'landscape', 'light'],
  },
  {
    id: '3',
    title: 'Telephone',
    status: 'in_progress',
    category: 'art',
    description: 'A single telephone in an empty room. Nobody calls.',
    concept: 'Absence made physical. The object that was supposed to connect.',
    year: '2025',
    tags: ['installation', 'object', 'silence'],
  },
  {
    id: '4',
    title: 'Suit',
    status: 'upcoming',
    category: 'fashion',
    description: 'What does a suit mean when there is no body inside it?',
    concept: 'The empty garment as portrait.',
    year: '2025',
    tags: ['fashion', 'body', 'absence'],
  },
  {
    id: '5',
    title: 'Red Is Cover',
    status: 'in_progress',
    category: 'brand',
    description: 'A brand identity exploring what it means to mark something as significant.',
    concept: 'Red as a decision. Red as a claim. Red as the beginning of a sentence.',
    year: '2025',
    tags: ['brand', 'color', 'language'],
  },
  {
    id: '6',
    title: 'Notes on Warmth',
    status: 'in_progress',
    category: 'writing',
    description: 'An ongoing collection of observations about tenderness in a cold age.',
    concept: 'Writing as a form of resistance against speed and distraction.',
    year: '2025',
    tags: ['writing', 'philosophy', 'warmth'],
  },
]

const CATEGORIES: Category[] = [
  { key: 'art', label: 'Art & Visual', number: '01', color: '#D91C1C' },
  { key: 'fashion', label: 'Fashion & Image', number: '02', color: '#C9B55A' },
  { key: 'brand', label: 'Brand & Concept', number: '03', color: '#B8CDD8' },
  { key: 'writing', label: 'Writing & Thought', number: '04', color: '#C4612A' },
  { key: 'worldbuilding', label: 'Worldbuilding', number: '05', color: '#8A8A8A' },
]

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: Category
  projectCount: number
  onClick: () => void
}

function CategoryRow({ category, projectCount, onClick }: CategoryRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      animate={{
        backgroundColor: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
      }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr auto auto',
        alignItems: 'center',
        gap: '24px',
        padding: '28px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
      }}
    >
      {/* Number */}
      <span
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        {category.number}
      </span>

      {/* Category label */}
      <motion.span
        animate={{
          borderLeftWidth: hovered ? '3px' : '0px',
          paddingLeft: hovered ? '16px' : '0px',
          borderLeftColor: category.color,
        }}
        transition={{ duration: 0.2 }}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(1.5rem, 3.5vw, 3.5rem)',
          fontWeight: 300,
          color: '#FAF8F5',
          lineHeight: 1.1,
          borderLeftStyle: 'solid',
        }}
      >
        {category.label}
      </motion.span>

      {/* Project count */}
      <span
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        {projectCount} {projectCount === 1 ? 'work' : 'works'}
      </span>

      {/* Arrow — visible on hover */}
      <motion.span
        animate={{
          opacity: hovered ? 1 : 0,
          x: hovered ? 0 : -8,
        }}
        transition={{ duration: 0.18 }}
        aria-hidden="true"
        style={{
          color: '#D91C1C',
          fontSize: '18px',
          fontFamily: "'DM Sans', sans-serif",
          width: '24px',
          textAlign: 'right',
        }}
      >
        →
      </motion.span>
    </motion.div>
  )
}

// ─── Inline Project Popup (until ProjectPopup component is built) ─────────────

interface ProjectPopupProps {
  categoryKey: string
  projects: Project[]
  categoryColor: string
  categoryLabel: string
  onClose: () => void
}

function InlineProjectPopup({
  categoryKey,
  projects,
  categoryColor,
  categoryLabel,
  onClose,
}: ProjectPopupProps) {
  const filtered = projects.filter((p) => p.category === categoryKey)

  const STATUS_LABELS: Record<Project['status'], string> = {
    completed: 'COMPLETED',
    in_progress: 'IN PROGRESS',
    upcoming: 'UPCOMING',
    archived: 'ARCHIVED',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6,6,6,0.72)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 48px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FAF8F5',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(6,6,6,0.15)',
        }}
      >
        {/* Popup title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#060606',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
            {(['#D91C1C', '#C9B55A', 'rgba(255,255,255,0.25)'] as const).map((color, i) => (
              <div
                key={i}
                style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: color }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {categoryLabel.toUpperCase()} — {filtered.length} WORKS
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.12em',
              padding: '2px 6px',
            }}
          >
            ESC
          </button>
        </div>

        {/* Category heading inside popup */}
        <div
          style={{
            padding: '32px 32px 0',
            borderBottom: '2px solid',
            borderBottomColor: categoryColor,
            paddingBottom: '24px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
              marginBottom: '8px',
            }}
          >
            CATEGORY
          </p>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 300,
              color: '#060606',
              lineHeight: 1.1,
            }}
          >
            {categoryLabel}
          </h3>
        </div>

        {/* Project list */}
        <div style={{ padding: '0 32px 32px' }}>
          {filtered.length === 0 ? (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.2rem',
                fontStyle: 'italic',
                color: '#8A8A8A',
                padding: '32px 0',
              }}
            >
              No works yet. Something is forming.
            </p>
          ) : (
            filtered.map((project, i) => (
              <div
                key={project.id}
                style={{
                  padding: '24px 0',
                  borderBottom:
                    i < filtered.length - 1 ? '1px solid rgba(6,6,6,0.08)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    gap: '16px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                      fontWeight: 300,
                      color: '#060606',
                      lineHeight: 1.2,
                    }}
                  >
                    {project.title}
                  </p>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '9px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: project.status === 'in_progress' ? categoryColor : '#8A8A8A',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    lineHeight: 1.7,
                    color: '#8A8A8A',
                    marginBottom: '8px',
                    maxWidth: '52ch',
                  }}
                >
                  {project.description}
                </p>

                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '14px',
                    fontStyle: 'italic',
                    lineHeight: 1.65,
                    color: 'rgba(6,6,6,0.55)',
                    maxWidth: '52ch',
                  }}
                >
                  {project.concept}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '12px',
                    }}
                  >
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '9px',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: '#8A8A8A',
                          border: '1px solid rgba(6,6,6,0.15)',
                          padding: '3px 10px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Categories Section ───────────────────────────────────────────────────────

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const getProjectCount = (key: string) =>
    MOCK_PROJECTS.filter((p) => p.category === key).length

  const activeCategoryData = CATEGORIES.find((c) => c.key === activeCategory)

  return (
    <>
      <section
        id="work"
        aria-label="Selected Work"
        style={{
          backgroundColor: '#060606',
          paddingTop: 'clamp(96px, 12vw, 192px)',
          paddingBottom: 'clamp(96px, 12vw, 192px)',
          paddingLeft: 'var(--page-margin)',
          paddingRight: 'var(--page-margin)',
        }}
      >
        {/* ── Section header ──────────────────────────────────────────────── */}
        <ScrollReveal variant="label" delay={0}>
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#D91C1C',
              marginBottom: '24px',
            }}
          >
            03 — SELECTED WORK
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              fontWeight: 300,
              color: '#FAF8F5',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: 'clamp(48px, 6vw, 80px)',
            }}
          >
            Chapters.
          </h2>
        </ScrollReveal>

        {/* ── Category list ────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {CATEGORIES.map((category, i) => (
            <ScrollReveal key={category.key} delay={i * 0.06}>
              <CategoryRow
                category={category}
                projectCount={getProjectCount(category.key)}
                onClick={() => setActiveCategory(category.key)}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Project popup ─────────────────────────────────────────────────── */}
      {activeCategory && activeCategoryData && (
        <InlineProjectPopup
          categoryKey={activeCategory}
          projects={MOCK_PROJECTS}
          categoryColor={activeCategoryData.color}
          categoryLabel={activeCategoryData.label}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </>
  )
}
