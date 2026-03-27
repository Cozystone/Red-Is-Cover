'use client'

/* PhoneCallScene — white page after telephone is picked up.
   Plays 챠우챠우 inst on loop. Content to be designed later. */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props { onClose: () => void }

export default function PhoneCallScene({ onClose }: Props) {
  // 챠우챠우 background music — loop
  useEffect(() => {
    const music = new Audio('/chowchow.mp3')
    music.loop   = true
    music.volume = 0.75
    music.play().catch(() => {})
    return () => { music.pause(); music.src = '' }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div style={{
      position:   'fixed',
      inset:      0,
      zIndex:     9002,
      background: '#f8f8f6',
      animation:  'pcFadeIn 0.8s ease-out forwards',
    }}>
      {/* ESC */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', top: 'clamp(20px,3vh,36px)', right: 'clamp(20px,3vw,36px)',
          fontFamily: "'Helvetica Neue',sans-serif", fontSize: '9px', fontWeight: 500,
          letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
          cursor: 'pointer', userSelect: 'none', padding: '12px',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.35)' }}
      >
        ESC · Close
      </div>

      <style>{`
        @keyframes pcFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  )
}
