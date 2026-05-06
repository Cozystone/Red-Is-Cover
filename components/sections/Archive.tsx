'use client'

/* Archive — Pinterest-style masonry image board
   흰 배경 + CSS columns masonry
   Admin 모드: + ADD IMAGE 버튼 + 카드 hover시 × 삭제 버튼 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAdmin } from '@/lib/adminContext'
import { getSupabase } from '@/lib/supabase'

const HV = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const ADMIN_PW = 'maurizio cattelan'

interface Pin {
  id: string
  image_url: string
  alt: string
  display_order: number
}

// ── Pin card ─────────────────────────────────────────────────────────────────

function PinCard({ pin, isAdmin, onDelete }: {
  pin: Pin
  isAdmin: boolean
  onDelete: (id: string) => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="archive-pin" style={{
      breakInside:     'avoid',
      marginBottom:    'clamp(8px, 1vw, 14px)',
      position:        'relative',
      borderRadius:    '12px',
      overflow:        'hidden',
      backgroundColor: '#ebebeb',
      cursor:          'default',
    }}>
      {!loaded && (
        <div style={{ paddingTop: `${100 + Math.random() * 60}%`, backgroundColor: '#ebebeb' }} />
      )}
      <img
        src={pin.image_url}
        alt={pin.alt || ''}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          display:    'block',
          width:      '100%',
          height:     'auto',
          opacity:    loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
      {isAdmin && (
        <button
          className="archive-pin-delete"
          onClick={() => onDelete(pin.id)}
          style={{
            position:        'absolute',
            top:             8,
            right:           8,
            width:           28,
            height:          28,
            borderRadius:    '50%',
            background:      'rgba(0,0,0,0.72)',
            color:           '#fff',
            border:          'none',
            fontSize:        '18px',
            lineHeight:      1,
            cursor:          'pointer',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            opacity:         0,
            transition:      'opacity 0.15s',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

const SKELETON_HEIGHTS = [120, 80, 140, 100, 160, 90, 130, 110, 150, 85, 125, 95]

function Skeleton() {
  return (
    <div style={{ columns: 'clamp(160px, 20vw, 280px)', gap: 'clamp(8px, 1vw, 14px)' }}>
      {SKELETON_HEIGHTS.map((h, i) => (
        <div
          key={i}
          style={{
            breakInside:     'avoid',
            marginBottom:    'clamp(8px, 1vw, 14px)',
            height:          h,
            backgroundColor: '#ebebeb',
            borderRadius:    '12px',
            animation:       'archive-shimmer 1.4s ease-in-out infinite',
            animationDelay:  `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Archive section ───────────────────────────────────────────────────────────

export default function Archive() {
  const { isAdmin } = useAdmin()
  const [pins,      setPins]      = useState<Pin[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchPins = useCallback(() => {
    fetch('/api/archive')
      .then(r => r.json())
      .then(d => setPins(d.pins ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchPins() }, [fetchPins])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const sb = getSupabase()
      if (!sb) throw new Error('Supabase not configured')

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue

        const path = `archive/${Date.now()}-${i}-${file.name.replace(/\s/g, '-')}`
        const { data, error: upErr } = await sb.storage
          .from('project-images')
          .upload(path, file, { upsert: false })
        if (upErr) { console.error(upErr); continue }

        const { data: { publicUrl } } = sb.storage.from('project-images').getPublicUrl(data.path)

        await fetch('/api/admin/archive', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PW },
          body:    JSON.stringify({ image_url: publicUrl, alt: file.name.replace(/\.[^.]+$/, ''), display_order: pins.length + i }),
        })
      }
      fetchPins()
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setPins(ps => ps.filter(p => p.id !== id)) // optimistic
    await fetch('/api/admin/archive', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PW },
      body:    JSON.stringify({ id }),
    }).catch(console.error)
  }

  return (
    <section
      id="archive"
      aria-label="Visual Archive"
      style={{ backgroundColor: '#FFFFFF', paddingBottom: 'clamp(80px, 10vw, 140px)' }}
    >
      {/* ── Header ── */}
      <div style={{
        paddingTop:    'clamp(80px, 10vw, 140px)',
        paddingLeft:   'var(--page-margin)',
        paddingRight:  'var(--page-margin)',
        marginBottom:  'clamp(32px, 4vw, 56px)',
      }}>
        <p style={{
          fontFamily:    HV,
          fontSize:      '10px',
          fontWeight:    500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         '#D91C1C',
          marginBottom:  '20px',
        }}>
          04 — VISUAL ARCHIVE
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{
            fontFamily:    HV,
            fontSize:      'clamp(2.2rem, 5vw, 4.5rem)',
            fontWeight:    300,
            color:         '#060606',
            lineHeight:    1.05,
            letterSpacing: '-0.025em',
          }}>
            A vocabulary<br />made of things.
          </h2>

          {isAdmin && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                fontFamily:      HV,
                fontSize:        '11px',
                fontWeight:      700,
                letterSpacing:   '0.15em',
                textTransform:   'uppercase',
                color:           '#fff',
                backgroundColor: uploading ? '#9aa0a6' : '#D91C1C',
                border:          'none',
                borderRadius:    '4px',
                padding:         '10px 22px',
                cursor:          uploading ? 'default' : 'pointer',
                flexShrink:      0,
                transition:      'background-color 0.2s',
              }}
            >
              {uploading ? 'UPLOADING…' : '+ ADD IMAGE'}
            </button>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(6,6,6,0.08)', marginTop: '28px' }} />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* ── Masonry grid ── */}
      <div style={{ paddingLeft: 'var(--page-margin)', paddingRight: 'var(--page-margin)' }}>
        {loading ? (
          <Skeleton />
        ) : pins.length === 0 ? (
          <p style={{ fontFamily: HV, color: '#bbb', fontSize: '14px', textAlign: 'center', padding: '80px 0', letterSpacing: '0.05em' }}>
            {isAdmin ? 'No images yet — click "+ ADD IMAGE" to start.' : '—'}
          </p>
        ) : (
          <div style={{
            columns: 'clamp(160px, 20vw, 280px)',
            gap:     'clamp(8px, 1vw, 14px)',
          }}>
            {pins.map(pin => (
              <PinCard key={pin.id} pin={pin} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .archive-pin:hover .archive-pin-delete { opacity: 1 !important; }
        @keyframes archive-shimmer {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}
