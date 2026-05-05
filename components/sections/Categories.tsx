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

function AlbumCard({ project, categoryColor, onClick }: {
  project: Project
  categoryColor: string
  onClick: () => void
}) {
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
        boxShadow:       hovered ? '0 8px 32px rgba(6,6,6,0.14)' : '0 1px 4px rgba(6,6,6,0.06)',
        transform:       hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      {project.image_url ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '66.67%', overflow: 'hidden' }}>
          <img src={project.image_url} alt={project.title} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }} />
        </div>
      ) : (
        <div aria-hidden="true" style={{
          width: '100%', paddingTop: '66.67%', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${categoryColor}18 0%, ${categoryColor}06 100%)`,
          borderBottom: `1px solid ${categoryColor}20`,
        }}>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontStyle: 'italic', fontWeight: 300,
            color: `${categoryColor}55`, padding: '12px', textAlign: 'center', lineHeight: 1.2,
          }}>
            {project.title}
          </span>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)', fontWeight: 300,
          color: '#060606', lineHeight: 1.25, marginBottom: '8px', letterSpacing: '-0.01em',
        }}>
          {project.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '8px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: STATUS_COLORS[project.status],
          }}>
            {STATUS_LABELS[project.status]}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '10px',
            color: 'rgba(6,6,6,0.35)', letterSpacing: '0.05em',
          }}>
            {project.year}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Browser tab ──────────────────────────────────────────────────────────────

function BrowserTab({ label, active, color, onClick }: {
  label: string
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '7px 14px 8px',
        backgroundColor: active ? '#FAF8F5' : 'transparent',
        border:          'none',
        borderTop:       active ? `2px solid ${color}` : '2px solid transparent',
        borderRight:     `1px solid ${active ? 'rgba(6,6,6,0.1)' : 'transparent'}`,
        borderLeft:      `1px solid ${active ? 'rgba(6,6,6,0.1)' : 'transparent'}`,
        borderBottom:    active ? '1px solid #FAF8F5' : 'none',
        cursor:          'pointer',
        marginBottom:    active ? '-1px' : '0',
        position:        'relative',
        zIndex:          active ? 2 : 1,
        flexShrink:      0,
        transition:      'background-color 0.15s ease',
      }}
    >
      {active && (
        <span aria-hidden="true" style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: color, flexShrink: 0,
        }} />
      )}
      <span style={{
        fontFamily:    "'DM Sans', sans-serif",
        fontSize:      '11px',
        fontWeight:    active ? 500 : 400,
        letterSpacing: '0.03em',
        color:         active ? '#060606' : 'rgba(6,6,6,0.4)',
        whiteSpace:    'nowrap',
      }}>
        {label}
      </span>
    </button>
  )
}

// ─── WorksBrowser ─────────────────────────────────────────────────────────────

export default function Categories() {
  const [activeTab,        setActiveTab]        = useState<ProjectCategory>('art')
  const [selectedProject,  setSelectedProject]  = useState<Project | null>(null)
  const [prevTab,          setPrevTab]          = useState<ProjectCategory>('art')
  const [direction,        setDirection]        = useState(0)

  const handleTabChange = useCallback((key: ProjectCategory) => {
    if (key === activeTab) return
    const fromIdx = CATEGORIES.findIndex(c => c.key === activeTab)
    const toIdx   = CATEGORIES.findIndex(c => c.key === key)
    setDirection(toIdx > fromIdx ? 1 : -1)
    setPrevTab(activeTab)
    setActiveTab(key)
  }, [activeTab])

  const handleClose = useCallback(() => setSelectedProject(null), [])

  const activeDef = CATEGORIES.find(c => c.key === activeTab)!
  const filtered  = MOCK_PROJECTS.filter(p => p.category === activeTab)

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
          <p style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#D91C1C', marginBottom: '24px',
          }}>
            03 — SELECTED WORK
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 300,
            color: '#FAF8F5', lineHeight: 1.0, letterSpacing: '-0.02em',
            marginBottom: 'clamp(40px, 5vw, 64px)',
          }}>
            Chapters.
          </h2>
        </ScrollReveal>

        {/* ── Browser window ──────────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <div style={{
            border:       '1px solid rgba(6,6,6,0.14)',
            boxShadow:    '0 16px 64px rgba(6,6,6,0.3)',
            borderRadius: '8px',
            overflow:     'hidden',
          }}>
            {/* Title bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 16px', backgroundColor: '#E4E1DC',
              borderBottom: '1px solid rgba(6,6,6,0.1)',
            }}>
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
                {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map((color, i) => (
                  <div key={i} aria-hidden="true"
                    style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color }} />
                ))}
              </div>

              {/* URL bar */}
              <div style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(6,6,6,0.1)', borderRadius: '6px',
                padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                maxWidth: '400px', margin: '0 auto',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: activeDef.color, flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
                  color: 'rgba(6,6,6,0.45)', letterSpacing: '0.01em',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  red-is-cover.world/work/{activeDef.slug}
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              backgroundColor: '#D6D2CC',
              borderBottom: '1px solid rgba(6,6,6,0.12)',
              paddingLeft: '12px', paddingTop: '8px',
              overflowX: 'auto',
            }}
              className="tab-bar"
            >
              {CATEGORIES.map(cat => (
                <BrowserTab
                  key={cat.key}
                  label={cat.label}
                  active={activeTab === cat.key}
                  color={cat.color}
                  onClick={() => handleTabChange(cat.key)}
                />
              ))}
            </div>

            {/* Content area — 탭 전환 시 슬라이드 애니메이션 (새로고침 없음) */}
            <div style={{ backgroundColor: '#FAF8F5', minHeight: '420px', overflow: 'hidden' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ padding: 'clamp(20px, 3vw, 40px)' }}
                >
                  {filtered.length === 0 ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                        fontStyle: 'italic', fontWeight: 300,
                        color: 'rgba(6,6,6,0.35)', lineHeight: 1.5,
                      }}>
                        Something is forming.
                      </p>
                    </div>
                  ) : (
                    <div className="works-grid">
                      {filtered.map(project => (
                        <AlbumCard
                          key={project.id}
                          project={project}
                          categoryColor={activeDef.color}
                          onClick={() => setSelectedProject(project)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ProjectDetailModal project={selectedProject} onClose={handleClose} />

      <style>{`
        .tab-bar::-webkit-scrollbar { display: none; }
        .tab-bar { scrollbar-width: none; }
        .works-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(12px, 2vw, 20px);
        }
        @media (max-width: 1100px) { .works-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .works-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 420px)  { .works-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
