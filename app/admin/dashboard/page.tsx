'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProjects, deleteProject } from '@/lib/projects'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Project['status'] }) {
  const styles: Record<Project['status'], { bg: string; color: string; label: string }> = {
    in_progress: { bg: '#D91C1C',              color: '#ffffff', label: 'IN PROGRESS' },
    upcoming:    { bg: '#C9B55A',              color: '#060606', label: 'UPCOMING'    },
    completed:   { bg: 'rgba(6,6,6,0.08)',     color: '#060606', label: 'COMPLETED'   },
    archived:    { bg: 'rgba(6,6,6,0.04)',     color: '#8A8A8A', label: 'ARCHIVED'    },
  }
  const s = styles[status]
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '8px',
        fontWeight: 500,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

type Tab = 'projects' | 'background'

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    // Clear both Supabase session and mock cookie
    await supabase?.auth.signOut()
    document.cookie = 'admin-auth=; path=/; max-age=0'
    router.push('/admin')
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete project.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F5F0',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        cursor: 'default',
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        style={{
          height: '56px',
          backgroundColor: '#060606',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--page-margin, clamp(24px, 5vw, 100px))',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#ffffff',
          }}
        >
          RED IS COVER — ADMIN
        </span>

        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#8A8A8A',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            cursor: 'default',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#D91C1C'
            e.currentTarget.style.color = '#D91C1C'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.color = '#8A8A8A'
          }}
        >
          Logout
        </button>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main
        style={{
          padding: '32px var(--page-margin, clamp(24px, 5vw, 100px))',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            borderBottom: '1px solid rgba(6,6,6,0.1)',
            marginBottom: '32px',
          }}
        >
          {(['projects', 'background'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid #D91C1C' : '2px solid transparent',
                marginBottom: '-1px',
                padding: '12px 20px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: tab === t ? '#060606' : '#8A8A8A',
                cursor: 'default',
                transition: 'color 0.2s ease',
              }}
            >
              {t === 'projects' ? 'Projects' : 'Background Images'}
            </button>
          ))}
        </div>

        {/* ── Projects Tab ─────────────────────────────────────────────── */}
        {tab === 'projects' && (
          <div>
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '28px',
                  fontWeight: 300,
                  color: '#060606',
                }}
              >
                Projects
              </h1>

              <Link href="/admin/dashboard/projects/new">
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#D91C1C',
                    color: '#ffffff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '10px 24px',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#B51818')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#D91C1C')
                  }
                >
                  + New Project
                </span>
              </Link>
            </div>

            {/* Table */}
            {loading ? (
              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8A8A',
                  padding: '40px 0',
                }}
              >
                Loading...
              </p>
            ) : projects.length === 0 ? (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '18px',
                  fontStyle: 'italic',
                  color: '#8A8A8A',
                  padding: '40px 0',
                }}
              >
                No projects yet.
              </p>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(6,6,6,0.08)',
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 100px 60px 120px',
                    gap: '16px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(6,6,6,0.08)',
                    backgroundColor: 'rgba(6,6,6,0.02)',
                  }}
                >
                  {['Status', 'Title', 'Category', 'Year', 'Actions'].map((col) => (
                    <span
                      key={col}
                      style={{
                        fontSize: '9px',
                        fontWeight: 500,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#8A8A8A',
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>

                {/* Table rows */}
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    deleting={deletingId === project.id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Background Images Tab ─────────────────────────────────────── */}
        {tab === 'background' && (
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '28px',
                fontWeight: 300,
                color: '#060606',
                marginBottom: '24px',
              }}
            >
              Background Images
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: '#8A8A8A',
                lineHeight: 1.7,
                maxWidth: '48ch',
              }}
            >
              Background image management coming soon. Configure your Supabase
              storage and update the background_images table to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Project Row ───────────────────────────────────────────────────────────────

function ProjectRow({
  project,
  deleting,
  onDelete,
}: {
  project: Project
  deleting: boolean
  onDelete: (id: string, title: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 100px 60px 120px',
        gap: '16px',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(6,6,6,0.06)',
        backgroundColor: hovered ? 'rgba(6,6,6,0.01)' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      <StatusBadge status={project.status} />

      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#060606',
          fontWeight: 400,
        }}
      >
        {project.title}
      </span>

      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          color: '#8A8A8A',
          letterSpacing: '0.08em',
          textTransform: 'capitalize',
        }}
      >
        {project.category}
      </span>

      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          color: '#8A8A8A',
        }}
      >
        {project.year}
      </span>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link
          href={`/admin/dashboard/projects/${project.id}/edit`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#060606',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(6,6,6,0.2)',
            paddingBottom: '1px',
            transition: 'color 0.15s ease',
          }}
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(project.id, project.title)}
          disabled={deleting}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: deleting ? '#8A8A8A' : '#D91C1C',
            cursor: 'default',
            padding: 0,
            opacity: deleting ? 0.5 : 1,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!deleting) e.currentTarget.style.opacity = '0.7'
          }}
          onMouseLeave={(e) => {
            if (!deleting) e.currentTarget.style.opacity = '1'
          }}
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
