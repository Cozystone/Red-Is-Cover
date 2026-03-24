'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  title: string
  status: 'in_progress' | 'upcoming' | 'completed' | 'archived'
  category: string
  description: string
  concept: string
  year: string
  tags?: string[]
  image_url?: string
}

interface ProjectPopupProps {
  category: string
  categoryLabel: string
  categoryColor: string
  projects: Project[]
  onClose: () => void
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Project['status'] }) {
  const styles: Record<
    Project['status'],
    { bg: string; color: string; label: string }
  > = {
    in_progress: { bg: '#D91C1C', color: '#ffffff', label: 'IN PROGRESS' },
    upcoming:    { bg: '#C9B55A', color: '#060606', label: 'UPCOMING' },
    completed:   { bg: 'rgba(6,6,6,0.08)', color: '#060606', label: 'COMPLETED' },
    archived:    { bg: 'rgba(6,6,6,0.04)', color: '#8A8A8A', label: 'ARCHIVED' },
  }

  const s = styles[status]

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        fontSize: '8px',
        fontWeight: 500,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: '2px',
        marginBottom: '8px',
      }}
    >
      {s.label}
    </span>
  )
}

// ─── Project Row ───────────────────────────────────────────────────────────────

function ProjectRow({
  project,
  index,
  isExpanded,
  onToggle,
  categoryColor,
}: {
  project: Project
  index: number
  isExpanded: boolean
  onToggle: () => void
  categoryColor: string
}) {
  return (
    <motion.div
      onMouseEnter={onToggle}
      onMouseLeave={onToggle}
      animate={{
        backgroundColor: isExpanded ? 'rgba(6,6,6,0.02)' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
      style={{
        borderBottom: '1px solid rgba(6,6,6,0.08)',
        padding: '28px 0',
        display: 'grid',
        gridTemplateColumns: '48px 1fr auto 80px',
        gap: '24px',
        alignItems: 'start',
        cursor: 'default',
      }}
    >
      {/* Col 1 — Index */}
      <span
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.12em',
          color: '#8A8A8A',
          paddingTop: '4px',
        }}
      >
        {String(index + 1).padStart(3, '0')}
      </span>

      {/* Col 2 — Status + Title + Concept */}
      <div>
        <StatusBadge status={project.status} />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
            fontWeight: 300,
            color: '#060606',
            lineHeight: 1.2,
            marginBottom: isExpanded ? '10px' : '0',
            transition: 'margin 0.25s ease',
          }}
        >
          {project.title}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.p
              key="concept"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                fontSize: '13px',
                color: '#8A8A8A',
                lineHeight: 1.7,
                overflow: 'hidden',
              }}
            >
              {project.concept}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Col 3 — Year */}
      <span
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          color: '#8A8A8A',
          paddingTop: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {project.year}
      </span>

      {/* Col 4 — Tags */}
      <span
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '8px',
          color: '#8A8A8A',
          paddingTop: '5px',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {project.tags?.join(' · ') ?? ''}
      </span>
    </motion.div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        gap: '12px',
      }}
    >
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '24px',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#8A8A8A',
        }}
      >
        Nothing here yet.
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '12px',
          color: '#8A8A8A',
        }}
      >
        Projects in progress.
      </p>
    </div>
  )
}

// ─── ProjectPopup ──────────────────────────────────────────────────────────────

export default function ProjectPopup({
  category,
  categoryLabel,
  categoryColor,
  projects,
  onClose,
}: ProjectPopupProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleRowToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <motion.div
        key="popup-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6,6,6,0.7)',
          zIndex: 200,
        }}
      />

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <motion.div
        key="popup-drawer"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '85vh',
          backgroundColor: '#FAF8F5',
          zIndex: 201,
          borderTop: `3px solid ${categoryColor}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Title Bar ──────────────────────────────────────────────────── */}
        <div
          style={{
            height: '56px',
            borderBottom: '1px solid rgba(6,6,6,0.1)',
            padding: '0 var(--page-margin)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Left: three dots + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: categoryColor,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6,6,6,0.2)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6,6,6,0.2)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#060606',
              }}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Right: close button */}
          <CloseButton onClose={onClose} />
        </div>

        {/* ── Content Area ───────────────────────────────────────────────── */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: 'clamp(32px, 4vw, 64px) var(--page-margin)',
          }}
        >
          {/* Project count */}
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              color: '#8A8A8A',
              marginBottom: '32px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {projects.length} {projects.length === 1 ? 'PROJECT' : 'PROJECTS'}
          </p>

          {/* Project list or empty state */}
          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {projects.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={i}
                  isExpanded={expandedId === project.id}
                  onToggle={() => handleRowToggle(project.id)}
                  categoryColor={categoryColor}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─── Close Button ──────────────────────────────────────────────────────────────

function CloseButton({ onClose }: { onClose: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px 0',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: hovered ? '#D91C1C' : '#8A8A8A',
        transition: 'color 0.2s ease',
        cursor: 'default',
      }}
    >
      [ CLOSE ]
    </button>
  )
}
