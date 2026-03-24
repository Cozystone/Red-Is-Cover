'use client'

import Link from 'next/link'
import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F5F0',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        cursor: 'default',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
        <Link
          href="/admin/dashboard"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#ffffff',
            textDecoration: 'none',
          }}
        >
          ANSEO ADMIN
        </Link>

        <Link
          href="/admin/dashboard"
          style={{
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#8A8A8A',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
            (e.currentTarget.style.color = '#ffffff')
          }
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
            (e.currentTarget.style.color = '#8A8A8A')
          }
        >
          ← Dashboard
        </Link>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main
        style={{
          padding: '40px var(--page-margin, clamp(24px, 5vw, 100px))',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
              marginBottom: '8px',
            }}
          >
            New Project
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '36px',
              fontWeight: 300,
              color: '#060606',
              lineHeight: 1.1,
            }}
          >
            Create a project.
          </h1>
        </div>

        <ProjectForm mode="create" />
      </main>
    </div>
  )
}
