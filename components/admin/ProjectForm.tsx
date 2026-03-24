'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject, updateProject } from '@/lib/projects'
import type { Project, ProjectStatus, ProjectCategory } from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProjectFormProps {
  project?: Project
  mode: 'create' | 'edit'
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#060606',
  display: 'block',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(6,6,6,0.15)',
  color: '#060606',
  padding: '10px 14px',
  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontSize: '13px',
  outline: 'none',
  borderRadius: '0',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8A8A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}

// ─── ProjectForm ───────────────────────────────────────────────────────────────

export default function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(project?.title ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'upcoming')
  const [category, setCategory] = useState<ProjectCategory>(project?.category ?? 'art')
  const [year, setYear] = useState(project?.year ?? new Date().getFullYear().toString())
  const [description, setDescription] = useState(project?.description ?? '')
  const [concept, setConcept] = useState(project?.concept ?? '')
  const [tagsInput, setTagsInput] = useState(project?.tags?.join(', ') ?? '')
  const [featured, setFeatured] = useState(project?.featured ?? false)

  const parsedTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      title,
      status,
      category,
      year,
      description,
      concept,
      tags: parsedTags,
      featured,
      display_order: project?.display_order ?? 0,
      image_url: project?.image_url,
    }

    try {
      if (mode === 'create') {
        await createProject(payload)
      } else if (project) {
        await updateProject(project.id, payload)
      }
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}
    >
      {/* Title */}
      <div>
        <label style={labelStyle}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Project title"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
        />
      </div>

      {/* Status + Category (side by side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            style={selectStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
          >
            <option value="upcoming">Upcoming</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
            style={selectStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
          >
            <option value="art">Art</option>
            <option value="fashion">Fashion</option>
            <option value="brand">Brand</option>
            <option value="writing">Writing</option>
            <option value="worldbuilding">Worldbuilding</option>
          </select>
        </div>
      </div>

      {/* Year */}
      <div>
        <label style={labelStyle}>Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="2025"
          style={{ ...inputStyle, maxWidth: '120px' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
        />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A short description of the project."
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
        />
      </div>

      {/* Concept */}
      <div>
        <label style={labelStyle}>Concept</label>
        <textarea
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          rows={4}
          placeholder="The underlying concept or idea."
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
        />
      </div>

      {/* Tags */}
      <div>
        <label style={labelStyle}>Tags</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="visual, object, memory"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(6,6,6,0.15)')}
        />
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: '#8A8A8A',
            marginTop: '6px',
          }}
        >
          Comma-separated
        </p>
        {parsedTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {parsedTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: '#060606',
                  backgroundColor: 'rgba(6,6,6,0.07)',
                  padding: '3px 10px',
                  borderRadius: '2px',
                  letterSpacing: '0.05em',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          style={{ width: '14px', height: '14px', accentColor: '#D91C1C', cursor: 'default' }}
        />
        <label
          htmlFor="featured"
          style={{
            ...labelStyle,
            marginBottom: 0,
            cursor: 'default',
          }}
        >
          Featured
        </label>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: '#D91C1C',
          }}
        >
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            backgroundColor: saving ? '#8A1010' : '#D91C1C',
            color: '#ffffff',
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '12px 32px',
            border: 'none',
            cursor: 'default',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.backgroundColor = '#B51818'
          }}
          onMouseLeave={(e) => {
            if (!saving) e.currentTarget.style.backgroundColor = '#D91C1C'
          }}
        >
          {saving ? 'SAVING...' : mode === 'create' ? 'CREATE PROJECT' : 'SAVE CHANGES'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8A8A8A',
            cursor: 'default',
            textDecoration: 'none',
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#060606')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8A8A')}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
