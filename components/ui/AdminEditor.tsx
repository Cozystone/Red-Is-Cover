'use client'

/* AdminEditor — 관리자 프로젝트 생성/편집 사이드패널
   우측에서 슬라이드인, 드래그앤드롭 이미지 업로드
   project prop이 있으면 edit 모드 (PATCH), 없으면 create 모드 (POST) */

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getSupabase } from '@/lib/supabase'
import type { Project, ProjectCategory, ProjectStatus } from '@/lib/types'

const HV = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const ADMIN_PW = 'maurizio cattelan'

interface Props {
  defaultCategory: ProjectCategory
  project?:        Project
  onClose:         () => void
  onSaved:         () => void
}

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'art',           label: 'Art & Visual'      },
  { value: 'fashion',       label: 'Fashion & Image'   },
  { value: 'brand',         label: 'Brand & Concept'   },
  { value: 'writing',       label: 'Writing & Thought' },
  { value: 'worldbuilding', label: 'Worldbuilding'     },
]

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
  { value: 'upcoming',    label: 'Upcoming'    },
  { value: 'archived',    label: 'Archived'    },
]

const inputStyle = {
  width:           '100%',
  fontFamily:      HV,
  fontSize:        '13px',
  color:           '#202124',
  backgroundColor: '#f8f9fa',
  border:          '1px solid #e0e0e0',
  borderRadius:    '4px',
  padding:         '9px 12px',
  outline:         'none',
  boxSizing:       'border-box' as const,
}

const labelStyle = {
  fontFamily:    HV,
  fontSize:      '10px',
  fontWeight:    600 as const,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color:         '#9aa0a6',
  marginBottom:  '6px',
  display:       'block',
}

export default function AdminEditor({ defaultCategory, project, onClose, onSaved }: Props) {
  const isEdit = !!project

  const [title,        setTitle]        = useState(project?.title       ?? '')
  const [category,     setCategory]     = useState<ProjectCategory>(project?.category ?? defaultCategory)
  const [status,       setStatus]       = useState<ProjectStatus>(project?.status     ?? 'in_progress')
  const [year,         setYear]         = useState(project?.year        ?? new Date().getFullYear().toString())
  const [description,  setDescription]  = useState(project?.description ?? '')
  const [concept,      setConcept]      = useState(project?.concept     ?? '')
  const [tags,         setTags]         = useState(project?.tags?.join(', ') ?? '')
  const [imageFile,    setImageFile]    = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_url ?? null)
  const [dragOver,     setDragOver]     = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)
    try {
      let image_url: string | undefined = project?.image_url

      // Upload image if a new file was selected
      if (imageFile) {
        const sb = getSupabase()
        if (sb) {
          const path = `${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`
          const { data, error: uploadErr } = await sb.storage
            .from('project-images')
            .upload(path, imageFile, { upsert: false })
          if (uploadErr) throw uploadErr
          const { data: { publicUrl } } = sb.storage.from('project-images').getPublicUrl(data.path)
          image_url = publicUrl
        }
      }

      const payload = {
        title:         title.trim(),
        category,
        status,
        year,
        description:   description.trim(),
        concept:       concept.trim(),
        tags:          tags.split(',').map(t => t.trim()).filter(Boolean),
        image_url,
        featured:      project?.featured      ?? false,
        display_order: project?.display_order ?? 99,
        ...(isEdit ? { id: project!.id } : {}),
      }

      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch('/api/admin/projects', {
        method,
        headers: {
          'Content-Type':    'application/json',
          'x-admin-password': ADMIN_PW,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `HTTP ${res.status}`)
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position:        'fixed',
        top:             0,
        right:           0,
        bottom:          0,
        width:           'min(440px, 100vw)',
        backgroundColor: '#fff',
        boxShadow:       '-8px 0 40px rgba(0,0,0,0.18)',
        zIndex:          400,
        display:         'flex',
        flexDirection:   'column',
        overflow:        'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding:        '16px 20px',
        borderBottom:   '1px solid #e0e0e0',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
      }}>
        <span style={{ fontFamily: HV, fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: '#202124' }}>
          {isEdit ? '✦ EDIT PROJECT' : '✦ NEW PROJECT'}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#5f6368', padding: '2px 6px' }}>
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Image upload */}
          <div>
            <span style={labelStyle}>Image</span>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border:          `2px dashed ${dragOver ? '#D91C1C' : '#e0e0e0'}`,
                borderRadius:    '4px',
                cursor:          'pointer',
                backgroundColor: dragOver ? 'rgba(217,28,28,0.04)' : '#f8f9fa',
                transition:      'border-color 0.15s, background-color 0.15s',
                overflow:        'hidden',
                minHeight:       '120px',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
                  <span style={{ fontFamily: HV, fontSize: '12px', color: '#9aa0a6' }}>
                    Drag & drop or click to select
                  </span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as ProjectCategory)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Year</label>
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="2025" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the project"
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
          </div>

          <div>
            <label style={labelStyle}>Concept</label>
            <textarea value={concept} onChange={e => setConcept(e.target.value)}
              placeholder="The conceptual idea behind this work"
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
          </div>

          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="visual, object, memory" style={inputStyle} />
          </div>

          {error && (
            <div style={{ fontFamily: HV, fontSize: '12px', color: '#EA4335', padding: '8px 12px', backgroundColor: '#fce8e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width:           '100%',
            fontFamily:      HV,
            fontSize:        '13px',
            fontWeight:      700,
            letterSpacing:   '0.1em',
            textTransform:   'uppercase',
            color:           '#fff',
            backgroundColor: saving ? '#9aa0a6' : '#D91C1C',
            border:          'none',
            borderRadius:    '4px',
            padding:         '12px',
            cursor:          saving ? 'default' : 'pointer',
            transition:      'background-color 0.2s',
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Project'}
        </button>
      </div>
    </motion.div>
  )
}
