import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '@/lib/projects'
import ProjectForm from '@/components/admin/ProjectForm'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
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
          }}
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
            Edit Project
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
            {project.title}
          </h1>
        </div>

        <ProjectForm mode="edit" project={project} />
      </main>
    </div>
  )
}
