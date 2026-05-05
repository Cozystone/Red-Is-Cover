'use client'

/* ProjectDetailModal — 프로젝트 상세 팝업
   backdrop 클릭 또는 ESC로 닫힘 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'

const STATUS_LABELS: Record<Project['status'], string> = {
  completed:   'COMPLETED',
  in_progress: 'IN PROGRESS',
  upcoming:    'UPCOMING',
  archived:    'ARCHIVED',
}

const STATUS_COLORS: Record<Project['status'], string> = {
  completed:   '#8A8A8A',
  in_progress: '#D91C1C',
  upcoming:    '#C9B55A',
  archived:    'rgba(6,6,6,0.3)',
}

const CATEGORY_COLORS: Record<Project['category'], string> = {
  art:           '#D91C1C',
  fashion:       '#C9B55A',
  brand:         '#B8CDD8',
  writing:       '#C4612A',
  worldbuilding: '#8A8A8A',
}

const CATEGORY_LABELS: Record<Project['category'], string> = {
  art:           'Art & Visual',
  fashion:       'Fashion & Image',
  brand:         'Brand & Concept',
  writing:       'Writing & Thought',
  worldbuilding: 'Worldbuilding',
}

interface ProjectDetailModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position:        'fixed',
            inset:           0,
            backgroundColor: 'rgba(6,6,6,0.82)',
            zIndex:          300,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            padding:         'clamp(16px, 4vw, 48px)',
          }}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FAF8F5',
              width:           '100%',
              maxWidth:        '680px',
              maxHeight:       '85vh',
              overflowY:       'auto',
              boxShadow:       '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Title bar ─────────────────────────────────────────────── */}
            <div
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '11px 18px',
                backgroundColor: '#060606',
                borderBottom:    '1px solid rgba(255,255,255,0.08)',
                position:        'sticky',
                top:             0,
                zIndex:          10,
              }}
            >
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                {(['#D91C1C', '#C9B55A', 'rgba(255,255,255,0.2)'] as const).map((color, i) => (
                  <div key={i} aria-hidden="true"
                    style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: color }}
                  />
                ))}
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '9px',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}>
                {CATEGORY_LABELS[project.category]}
              </span>
              <button onClick={onClose} aria-label="Close" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '10px',
                letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', padding: '2px 6px',
              }}>
                ESC
              </button>
            </div>

            {/* ── Thumbnail ─────────────────────────────────────────────── */}
            {project.image_url ? (
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
                <img src={project.image_url} alt={project.title} style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                }} />
              </div>
            ) : (
              <div aria-hidden="true" style={{
                width: '100%', height: '180px',
                background: `linear-gradient(135deg, ${CATEGORY_COLORS[project.category]}22 0%, ${CATEGORY_COLORS[project.category]}08 100%)`,
                borderBottom: `2px solid ${CATEGORY_COLORS[project.category]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, fontStyle: 'italic',
                  color: `${CATEGORY_COLORS[project.category]}60`, letterSpacing: '-0.02em',
                }}>
                  {project.title}
                </span>
              </div>
            )}

            {/* ── Body ──────────────────────────────────────────────────── */}
            <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '9px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: STATUS_COLORS[project.status],
                  border: `1px solid ${STATUS_COLORS[project.status]}`, padding: '3px 10px',
                }}>
                  {STATUS_LABELS[project.status]}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '10px',
                  letterSpacing: '0.12em', color: '#8A8A8A',
                }}>
                  {project.year}
                </span>
              </div>

              <h2 style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 300,
                color: '#060606', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '20px',
              }}>
                {project.title}
              </h2>

              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
                lineHeight: 1.8, color: 'rgba(6,6,6,0.65)', marginBottom: '20px', maxWidth: '52ch',
              }}>
                {project.description}
              </p>

              <blockquote style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontStyle: 'italic', fontWeight: 300,
                lineHeight: 1.65, color: 'rgba(6,6,6,0.55)',
                borderLeft: `3px solid ${CATEGORY_COLORS[project.category]}`,
                paddingLeft: '20px', margin: '0 0 24px', maxWidth: '48ch',
              }}>
                {project.concept}
              </blockquote>

              {project.tags && project.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.tags.map((tag) => (
                    <span key={tag} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '9px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: '#8A8A8A', border: '1px solid rgba(6,6,6,0.15)', padding: '3px 10px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
