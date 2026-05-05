'use client'

/* Categories Section — Windows Chrome 새 탭 레플리카
   탭 = 카테고리 / 북마크바 = 5개 외부 링크 / 새 탭 화면 = Google 스타일 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import ProjectDetailModal from '@/components/ui/ProjectDetailModal'
import { MOCK_PROJECTS } from '@/lib/projects'
import type { Project, ProjectCategory } from '@/lib/types'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'art'           as ProjectCategory, label: 'Art & Visual',      short: 'Art & Visual',  color: '#D91C1C', initial: 'A', slug: 'art-and-visual'      },
  { key: 'fashion'       as ProjectCategory, label: 'Fashion & Image',   short: 'Fashion',        color: '#C9B55A', initial: 'F', slug: 'fashion-and-image'   },
  { key: 'brand'         as ProjectCategory, label: 'Brand & Concept',   short: 'Brand',          color: '#B8CDD8', initial: 'B', slug: 'brand-and-concept'   },
  { key: 'writing'       as ProjectCategory, label: 'Writing & Thought', short: 'Writing',        color: '#C4612A', initial: 'W', slug: 'writing-and-thought' },
  { key: 'worldbuilding' as ProjectCategory, label: 'Worldbuilding',     short: 'World',          color: '#8A8A8A', initial: 'W', slug: 'worldbuilding'        },
]

const BOOKMARKS = [
  { label: 'Virgil Abloh',   url: 'https://www.instagram.com/virgilabloh/', bg: '#E1306C', fg: '#fff' },
  { label: 'MSCHF',          url: 'https://mschf.com/',                      bg: '#FF0000', fg: '#fff' },
  { label: 'CANARY YELLOW',  url: 'https://canary---yellow.com/',            bg: '#F5C518', fg: '#000' },
  { label: 'FREE GAME',      url: 'https://free---game.com/',                bg: '#111111', fg: '#fff' },
  { label: 'VAA',            url: 'https://vaa-landing.netlify.app/',        bg: '#4A90D9', fg: '#fff' },
]

// "Chapters." → Google-color 워드마크
const CHAPTERS_COLORS = ['#4285F4','#EA4335','#FBBC05','#4285F4','#34A853','#EA4335','#FBBC05','#4285F4']

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChromeTab({ label, active, color, onClick, onClose }: {
  label: string; active: boolean; color: string
  onClick: () => void; onClose: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        padding:      '0 8px 0 12px',
        height:       '34px',
        minWidth:     '80px',
        maxWidth:     '200px',
        backgroundColor: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderRadius:    active ? '8px 8px 0 0' : '0',
        cursor:       'pointer',
        position:     'relative',
        flexShrink:   0,
        transition:   'background-color 0.1s',
        marginTop:    active ? '2px' : '4px',
      }}
    >
      {/* favicon dot */}
      <span style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        backgroundColor: color, display: 'block',
      }} />
      <span style={{
        fontFamily:  "'DM Sans', sans-serif",
        fontSize:    '12px',
        fontWeight:  active ? 500 : 400,
        color:       active ? '#202124' : 'rgba(255,255,255,0.7)',
        overflow:    'hidden',
        whiteSpace:  'nowrap',
        textOverflow:'ellipsis',
        flex:        1,
      }}>
        {label}
      </span>
      <span
        onClick={onClose}
        style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: active ? '#5f6368' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          backgroundColor: hovered ? 'rgba(0,0,0,0.08)' : 'transparent',
        }}
      >
        ×
      </span>
    </div>
  )
}

function BookmarkItem({ label, url, bg, fg }: typeof BOOKMARKS[0]) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '5px',
        padding:     '3px 8px',
        borderRadius:'4px',
        textDecoration: 'none',
        flexShrink:  0,
        cursor:      'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* favicon */}
      <span style={{
        width: 14, height: 14, borderRadius: '3px', flexShrink: 0,
        backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '8px', fontWeight: 700, color: fg, fontFamily: "'DM Sans', sans-serif",
      }}>
        {label[0]}
      </span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
        color: '#202124', whiteSpace: 'nowrap', maxWidth: '120px',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {label}
      </span>
    </a>
  )
}

function CategoryShortcut({ cat, onClick }: { cat: typeof CATEGORIES[0]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '10px',
        background:    'none',
        border:        'none',
        cursor:        'pointer',
        padding:       '12px 10px',
        borderRadius:  '12px',
        backgroundColor: hovered ? 'rgba(255,255,255,0.12)' : 'transparent',
        transition:    'background-color 0.15s',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.15s',
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '22px', fontWeight: 400,
          color: cat.color,
        }}>
          {cat.initial}
        </span>
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
        color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.2,
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        maxWidth: '72px',
      }}>
        {cat.short}
      </span>
    </button>
  )
}

function AlbumCard({ project, categoryColor, onClick }: {
  project: Project; categoryColor: string; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const STATUS_LABELS: Record<Project['status'], string> = {
    completed: 'COMPLETED', in_progress: 'IN PROGRESS',
    upcoming: 'UPCOMING',   archived: 'ARCHIVED',
  }
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', backgroundColor: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.13)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.18s, transform 0.18s',
        borderRadius: '4px', overflow: 'hidden',
      }}
    >
      {/* Thumbnail */}
      {project.image_url ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '66.67%', overflow: 'hidden' }}>
          <img src={project.image_url} alt={project.title} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease',
          }} />
        </div>
      ) : (
        <div style={{
          width: '100%', paddingTop: '66.67%', position: 'relative',
          background: `linear-gradient(135deg, ${categoryColor}20 0%, ${categoryColor}08 100%)`,
          borderBottom: `1px solid ${categoryColor}25`,
        }}>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', fontStyle: 'italic', fontWeight: 300,
            color: `${categoryColor}55`, padding: '12px', textAlign: 'center', lineHeight: 1.2,
          }}>
            {project.title}
          </span>
        </div>
      )}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', fontWeight: 300,
          color: '#202124', lineHeight: 1.25, marginBottom: '7px',
        }}>
          {project.title}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: project.status === 'in_progress' ? categoryColor : '#9aa0a6',
          }}>
            {STATUS_LABELS[project.status]}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#9aa0a6' }}>
            {project.year}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type ViewState = 'newtab' | ProjectCategory

export default function Categories() {
  const [view,            setView]            = useState<ViewState>('newtab')
  const [direction,       setDirection]       = useState(0)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const activeCat = CATEGORIES.find(c => c.key === view)

  const goTo = useCallback((next: ViewState) => {
    if (next === view) return
    if (next !== 'newtab' && view !== 'newtab') {
      const fromIdx = CATEGORIES.findIndex(c => c.key === view)
      const toIdx   = CATEGORIES.findIndex(c => c.key === next)
      setDirection(toIdx > fromIdx ? 1 : -1)
    } else {
      setDirection(next === 'newtab' ? -1 : 1)
    }
    setView(next)
  }, [view])

  const filtered = view !== 'newtab'
    ? MOCK_PROJECTS.filter(p => p.category === view)
    : []

  const urlBar = view === 'newtab'
    ? 'chrome://newtab/'
    : `red-is-cover.world/work/${activeCat?.slug}`

  return (
    <>
      <section
        id="work"
        aria-label="Selected Work"
        style={{
          backgroundColor: '#060606',
          paddingTop:  'clamp(96px, 12vw, 192px)',
          paddingBottom:'clamp(96px, 12vw, 192px)',
          paddingLeft: 'var(--page-margin)',
          paddingRight:'var(--page-margin)',
        }}
      >
        <ScrollReveal variant="label" delay={0}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D91C1C', marginBottom: '24px',
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

        {/* ── Chrome browser window ───────────────────────────────────── */}
        <div style={{
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          border: '1px solid rgba(0,0,0,0.3)',
        }}>

            {/* ── 1. Tab strip (Windows Chrome — dark) ──────────────── */}
            <div style={{
              backgroundColor: '#202124',
              display: 'flex',
              alignItems: 'flex-end',
              paddingLeft: '8px',
              paddingTop: '8px',
              height: '42px',
              position: 'relative',
            }}>
              {/* Left: App menu icon */}
              <div style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginRight: '4px',
                marginBottom: '4px',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect y="2"  width="16" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
                  <rect y="7"  width="16" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
                  <rect y="12" width="16" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
                </svg>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, overflow: 'hidden', gap: '1px' }}>
                {/* "새 탭" tab */}
                <ChromeTab
                  label="새 탭"
                  active={view === 'newtab'}
                  color="#5f6368"
                  onClick={() => goTo('newtab')}
                  onClose={e => { e.stopPropagation() }}
                />
                {CATEGORIES.map(cat => (
                  <ChromeTab
                    key={cat.key}
                    label={cat.short}
                    active={view === cat.key}
                    color={cat.color}
                    onClick={() => goTo(cat.key)}
                    onClose={e => { e.stopPropagation() }}
                  />
                ))}
                {/* New tab + button */}
                <div style={{
                  width: 28, height: 28, marginBottom: '3px', marginLeft: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  color: 'rgba(255,255,255,0.6)', fontSize: '18px', lineHeight: 1,
                }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  +
                </div>
              </div>

              {/* Right: Windows window controls */}
              <div style={{
                display: 'flex', alignItems: 'center',
                height: '100%', flexShrink: 0,
              }}>
                {[
                  { label: '−', hover: 'rgba(255,255,255,0.1)' },
                  { label: '⊡', hover: 'rgba(255,255,255,0.1)' },
                  { label: '×', hover: '#c42b1c' },
                ].map(({ label, hover }) => (
                  <div
                    key={label}
                    style={{
                      width: 46, height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.7)', fontSize: label === '×' ? '14px' : '12px',
                      cursor: 'default', flexShrink: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = hover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. Navigation bar ──────────────────────────────────── */}
            <div style={{
              backgroundColor: '#f1f3f4',
              display: 'flex', alignItems: 'center',
              gap: '4px', padding: '6px 12px',
              borderBottom: '1px solid #dadce0',
            }}>
              {/* Nav buttons */}
              {['←', '→', '↻'].map((icon, i) => (
                <button key={i} onClick={icon === '←' && view !== 'newtab' ? () => goTo('newtab') : undefined}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                    backgroundColor: 'transparent', cursor: i === 0 && view !== 'newtab' ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', color: i === 0 && view !== 'newtab' ? '#202124' : '#9aa0a6',
                  }}
                  onMouseEnter={e => { if (i === 0 && view !== 'newtab') e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {icon}
                </button>
              ))}

              {/* Address bar */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#ffffff', borderRadius: '100px',
                padding: '6px 16px',
                border: '1px solid #dadce0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="4.5" stroke="#9aa0a6" strokeWidth="1.5" />
                  <path d="M10 10L13 13" stroke="#9aa0a6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  color: '#202124', flex: 1,
                }}>
                  {urlBar}
                </span>
                {/* Star */}
                <span style={{ color: '#9aa0a6', fontSize: '14px', cursor: 'default' }}>☆</span>
              </div>

              {/* Right icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {['⬡', '⊕', '⋮'].map((icon, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', cursor: 'default', fontSize: '14px', color: '#5f6368',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. Bookmarks bar ───────────────────────────────────── */}
            <div style={{
              backgroundColor: '#f1f3f4',
              display: 'flex', alignItems: 'center',
              padding: '2px 12px',
              borderBottom: '1px solid #dadce0',
              gap: '0',
              overflowX: 'auto',
            }}
              className="bkm-bar"
            >
              {BOOKMARKS.map(bm => (
                <BookmarkItem key={bm.url} {...bm} />
              ))}
              <div style={{
                marginLeft: '4px', padding: '3px 6px', flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#5f6368',
                cursor: 'default',
              }}>
                »
              </div>
            </div>

            {/* ── 4. Content area ────────────────────────────────────── */}
            <div style={{
              position: 'relative',
              minHeight: '520px',
              backgroundImage: 'url(/golmok-alley.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden',
            }}>
              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)',
                backdropFilter: 'blur(0px)',
              }} />

              {/* Top-right page actions */}
              <div style={{
                position: 'absolute', top: 16, right: 20,
                display: 'flex', alignItems: 'center', gap: '16px', zIndex: 2,
              }}>
                {['Gmail', '이미지'].map(label => (
                  <span key={label} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                    color: 'rgba(255,255,255,0.85)', cursor: 'default',
                  }}>
                    {label}
                  </span>
                ))}
                {/* Profile avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  backgroundColor: '#D91C1C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: '#fff',
                }}>
                  R
                </div>
              </div>

              {/* Content — animated switch between newtab / category view */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {view === 'newtab' ? (
                    <motion.div
                      key="newtab"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        paddingTop: 'clamp(48px, 8vw, 80px)',
                        paddingBottom: '40px',
                      }}
                    >
                      {/* "Chapters." — Google 워드마크 스타일 */}
                      <div style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(52px, 9vw, 90px)',
                        fontWeight: 400, lineHeight: 1, marginBottom: '32px',
                        letterSpacing: '-0.02em',
                        display: 'flex',
                        filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.4))',
                      }}>
                        {'Chapters.'.split('').map((ch, i) => (
                          <span key={i} style={{
                            color: CHAPTERS_COLORS[i] ?? 'rgba(255,255,255,0.6)',
                          }}>{ch}</span>
                        ))}
                      </div>

                      {/* Search bar — Chrome 스타일 */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '100px', padding: '12px 20px',
                        width: 'min(560px, 90%)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                        marginBottom: 'clamp(32px, 5vw, 48px)',
                      }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="5.5" stroke="#9aa0a6" strokeWidth="1.8" />
                          <path d="M13 13L16.5 16.5" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '16px',
                          color: '#9aa0a6', flex: 1,
                        }}>
                          카테고리를 선택하거나 작업을 탐색하세요
                        </span>
                        {/* AI 모드 */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '100px',
                          border: '1px solid rgba(0,0,0,0.15)',
                          fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#444',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '10px' }}>✦</span>
                          <span>AI 모드</span>
                        </div>
                      </div>

                      {/* Category shortcut circles */}
                      <div style={{
                        display: 'flex', gap: 'clamp(8px, 2vw, 24px)',
                        flexWrap: 'wrap', justifyContent: 'center',
                        padding: '0 24px',
                      }}>
                        {CATEGORIES.map(cat => (
                          <CategoryShortcut
                            key={cat.key}
                            cat={cat}
                            onClick={() => goTo(cat.key)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, x: direction * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -40 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      style={{ padding: 'clamp(20px, 3vw, 40px)' }}
                    >
                      {/* Category heading */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
                      }}>
                        <button
                          onClick={() => goTo('newtab')}
                          style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '14px', backdropFilter: 'blur(4px)',
                          }}
                        >
                          ←
                        </button>
                        <span style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300,
                          color: '#fff', letterSpacing: '-0.01em',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}>
                          {activeCat?.label}
                        </span>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
                          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em',
                          marginTop: '4px',
                        }}>
                          {filtered.length} works
                        </span>
                      </div>

                      {filtered.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                          <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                            fontStyle: 'italic', color: 'rgba(255,255,255,0.45)',
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
                              categoryColor={activeCat?.color ?? '#D91C1C'}
                              onClick={() => setSelectedProject(project)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </section>

      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      <style>{`
        .bkm-bar::-webkit-scrollbar { display: none; }
        .bkm-bar { scrollbar-width: none; }
        .works-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1.5vw, 18px);
        }
        @media (max-width: 1100px) { .works-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .works-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .works-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
