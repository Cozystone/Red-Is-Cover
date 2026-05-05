'use client'

/* Categories Section — WorksBrowser
   브라우저 창 UI가 섹션 안에 embedded.
   상단 탭으로 카테고리 전환, 카드 클릭 시 ProjectDetailModal 열림. */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ProjectDetailModal from '@/components/ui/ProjectDetailModal'
import { MOCK_PROJECTS } from '@/lib/projects'
import type { Project, ProjectCategory } from '@/lib/types'

// ─── Category config ──────────────────────────────────────────────────────────

interface CategoryDef {
  key: ProjectCategory
  label: string
  color: string
  slug: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'art',           label: 'Art & Visual',      color: '#D91C1C', slug: 'art-and-visual'      },
  { key: 'fashion',       label: 'Fashion & Image',   color: '#C9B55A', slug: 'fashion-and-image'   },
  { key: 'brand',         label: 'Brand & Concept',   color: '#B8CDD8', slug: 'brand-and-concept'   },
  { key: 'writing',       label: 'Writing & Thought', color: '#C4612A', slug: 'writing-and-thought' },
  { key: 'worldbuilding', label: 'Worldbuilding',     color: '#8A8A8A', slug: 'worldbuilding'        },
]

// ─── Album card ───────────────────────────────────────────────────────────────

interface AlbumCardProps {
  project: Project
  categoryColor: string
  onClick: () => void
}

function AlbumCard({ project, categoryColor, onClick }: AlbumCardProps) {
  const [hovered, setHovered] = useState(false)

  const STATUS_LABELS: Record<Project['status'], string> = {
    completed:   'COMPLETED',
    in_progress: 'IN PROGRESS',
    upcoming:    'UPCOMING',
    archived:    'ARCHIVED',
  }
  const STATUS_COLORS: Record<Project['status'], string> = {
    completed:   '#8A8A8A',
    in_progress: categoryColor,
    upcoming:    '#C9B55A',
    archived:    'rgba(6,6,6,0.25)',
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor:          'pointer',
        backgroundColor: '#FFFFFF',
        border:          '1px solid rgba(6,6,6,0.08)',
        transition:      'box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow:       hovered
          ? '0 8px 32px rgba(6,6,6,0.14)'
          : '0 1px 4px rgba(6,6,6,0.06)',
        transform:       hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      {project.image_url ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '66.67%', overflow: 'hidden' }}>
          <img
            src={project.image_url}
            alt={project.title}
            style={{
              position:  'absolute',
              inset:     0,
              width:     '100%',
              height:    '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform:  hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{
            width:      '100%',
            paddingTop: '66.67%',
            position:   'relative',
            overflow:   'hidden',
            background: `linear-gradient(135deg, ${categoryColor}18 0%, ${categoryColor}06 100%)`,
            borderBottom: `1px solid ${categoryColor}20`,
          }}
        >
          <span
            style={{
              position:      'absolute',
              inset:         0,
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              fontSize:      'clamp(1.4rem, 3vw, 2rem)',
              fontStyle:     'italic',
              fontWeight:    300,
              color:         `${categoryColor}50`,
              padding:       '12px',
              textAlign:     'center',
              lineHeight:    1.2,
            }}
          >
            {project.title}
          </span>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p
          style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontSize:      'clamp(1rem, 1.8vw, 1.25rem)',
            fontWeight:    300,
            color:         '#060606',
            lineHeight:    1.25,
            marginBottom:  '8px',
            letterSpacing: '-0.01em',
          }}
        >
          {project.title}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      '8px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         STATUS_COLORS[project.status],
            }}
          >
            {STATUS_LABELS[project.status]}
          </span>
          <span
            style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      '10px',
              color:         'rgba(6,6,6,0.35)',
              letterSpacing: '0.05em',
            }}
          >
            {project.year}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Browser tab ──────────────────────────────────────────────────────────────

interface BrowserTabProps {
  label: string
  active: boolean
  color: string
  onClick: () => void
}

function BrowserTab({ label, active, color, onClick }: BrowserTabProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '8px 16px',
        backgroundColor: active
          ? '#FAF8F5'
          : hovered
            ? 'rgba(6,6,6,0.06)'
            : 'transparent',
        border:          'none',
        borderTop:       active ? `2px solid ${color}` : '2px solid transparent',
        borderRight:     active ? '1px solid rgba(6,6,6,0.1)' : '1px solid transparent',
        borderLeft:      active ? '1px solid rgba(6,6,6,0.1)' : '1px solid transparent',
        borderBottom:    active ? '1px solid #FAF8F5' : 'none',
        cursor:          'pointer',
        transition:      'background-color 0.15s ease',
        marginBottom:    active ? '-1px' : '0',
        position:        'relative',
        zIndex:          active ? 2 : 1,
        flexShrink:      0,
      }}
    >
      {active && (
        <span
          aria-hidden="true"
          style={{
            width:           6,
            height:          6,
            borderRadius:    '50%',
            backgroundColor: color,
            flexShrink:      0,
          }}
        />
      )}
      <span
        style={{
          fontFamily:    "'DM Sans', sans-serif",
          fontSize:      '11px',
          fontWeight:    active ? 500 : 400,
          letterSpacing: '0.04em',
          color:         active ? '#060606' : 'rgba(6,6,6,0.45)',
          whiteSpace:    'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ─── WorksBrowser ─────────────────────────────────────────────────────────────

interface WorksBrowserProps {
  activeTab: ProjectCategory
  onTabChange: (key: ProjectCategory) => void
  onProjectClick: (project: Project) => void
}

function WorksBrowser({ activeTab, onTabChange, onProjectClick }: WorksBrowserProps) {
  const activeDef = CATEGORIES.find((c) => c.key === activeTab)!
  const filtered  = MOCK_PROJECTS.filter((p) => p.category === activeTab)

  const urlSlug = activeDef.slug

  return (
    <div
      style={{
        border:       '1px solid rgba(6,6,6,0.14)',
        boxShadow:    '0 16px 64px rgba(6,6,6,0.25)',
        borderRadius: '8px',
        overflow:     'hidden',
      }}
    >
      {/* ── Title bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             '12px',
          padding:         '11px 16px',
          backgroundColor: '#E8E5E0',
          borderBottom:    '1px solid rgba(6,6,6,0.1)',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
          {(['#D91C1C', '#C9B55A', '#AAAAAA'] as const).map((color, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: color }}
            />
          ))}
        </div>

        {/* URL bar */}
        <div
          aria-hidden="true"
          style={{
            flex:            1,
            backgroundColor: 'rgba(255,255,255,0.75)',
            border:          '1px solid rgba(6,6,6,0.12)',
            borderRadius:    '5px',
            padding:         '5px 12px',
            display:         'flex',
            alignItems:      'center',
            gap:             '6px',
            maxWidth:        '420px',
            margin:          '0 auto',
          }}
        >
          <span
            style={{
              width:           6,
              height:          6,
              borderRadius:    '50%',
              backgroundColor: activeDef.color,
              flexShrink:      0,
            }}
          />
          <span
            style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      '11px',
              color:         'rgba(6,6,6,0.5)',
              letterSpacing: '0.01em',
              overflow:      'hidden',
              whiteSpace:    'nowrap',
              textOverflow:  'ellipsis',
            }}
          >
            red-is-cover.world/work/{urlSlug}
          </span>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          display:         'flex',
          alignItems:      'flex-end',
          backgroundColor: '#DEDBD5',
          borderBottom:    '1px solid rgba(6,6,6,0.1)',
          paddingLeft:     '12px',
          paddingTop:      '6px',
          overflowX:       'auto',
          scrollbarWidth:  'none',
        }}
      >
        {CATEGORIES.map((cat) => (
          <BrowserTab
            key={cat.key}
            label={cat.label}
            active={activeTab === cat.key}
            color={cat.color}
            onClick={() => onTabChange(cat.key)}
          />
        ))}
      </div>

      {/* ── Content area ──────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FAF8F5',
          minHeight:       '400px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: 'clamp(20px, 3vw, 40px)' }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding:      '80px 0',
                  textAlign:    'center',
                }}
              >
                <p
                  style={{
                    fontFamily:  "'Cormorant Garamond', Georgia, serif",
                    fontSize:    'clamp(1.2rem, 2.5vw, 1.6rem)',
                    fontStyle:   'italic',
                    fontWeight:  300,
                    color:       'rgba(6,6,6,0.35)',
                    lineHeight:  1.5,
                  }}
                >
                  Something is forming.
                </p>
              </div>
            ) : (
              <div
                className="works-grid"
                style={{
                  display:             'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap:                 'clamp(12px, 2vw, 20px)',
                }}
              >
                {filtered.map((project) => (
                  <AlbumCard
                    key={project.id}
                    project={project}
                    categoryColor={activeDef.color}
                    onClick={() => onProjectClick(project)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Categories() {
  const [activeTab,       setActiveTab]       = useState<ProjectCategory>('art')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedProject(null)
  }, [])

  return (
    <>
      <section
        id="work"
        aria-label="Selected Work"
        style={{
          backgroundColor: '#060606',
          paddingTop:      'clamp(96px, 12vw, 192px)',
          paddingBottom:   'clamp(96px, 12vw, 192px)',
          paddingLeft:     'var(--page-margin)',
          paddingRight:    'var(--page-margin)',
        }}
      >
        {/* ── Section header ──────────────────────────────────────────── */}
        <ScrollReveal variant="label" delay={0}>
          <p
            style={{
              fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize:      '10px',
              fontWeight:    500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         '#D91C1C',
              marginBottom:  '24px',
            }}
          >
            03 — SELECTED WORK
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h2
            style={{
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              fontSize:      'clamp(3rem, 8vw, 8rem)',
              fontWeight:    300,
              color:         '#FAF8F5',
              lineHeight:    1.0,
              letterSpacing: '-0.02em',
              marginBottom:  'clamp(40px, 5vw, 64px)',
            }}
          >
            Chapters.
          </h2>
        </ScrollReveal>

        {/* ── WorksBrowser ────────────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <WorksBrowser
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onProjectClick={handleProjectClick}
          />
        </ScrollReveal>
      </section>

      {/* ── Project detail modal ────────────────────────────────────── */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={handleClose}
      />

      <style>{`
        .works-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1100px) {
          .works-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 720px) {
          .works-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 420px) {
          .works-grid { grid-template-columns: 1fr; }
        }
        /* 탭바 스크롤바 숨김 */
        div[style*="overflowX: auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}
