'use client'

/* PinterestBoard — masonry grid of "inspired" board pins */

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface PinImage {
  id: string
  url: string
  alt: string
}

function PinCard({ pin }: { pin: PinImage }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      style={{
        breakInside:   'avoid',
        marginBottom:  'clamp(6px, 1vw, 12px)',
        overflow:      'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        position:      'relative',
      }}
    >
      <img
        src={pin.url}
        alt={pin.alt || ''}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          display:    'block',
          width:      '100%',
          height:     'auto',
          opacity:    loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
      {!loaded && (
        <div style={{
          paddingTop:      '120%',
          backgroundColor: 'rgba(255,255,255,0.06)',
        }} />
      )}
    </div>
  )
}

export default function PinterestBoard() {
  const [images, setImages]     = useState<PinImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    fetch('/api/pinterest')
      .then(r => r.json())
      .then(data => {
        setImages(data.images ?? [])
        setConfigured(data.configured !== false)
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [])

  // Don't render section at all if API not configured or empty
  if (!loading && (!configured || images.length === 0)) return null

  return (
    <section
      id="inspired"
      aria-label="Inspired"
      style={{
        backgroundColor: '#060606',
        paddingTop:      'clamp(80px, 10vw, 140px)',
        paddingBottom:   'clamp(80px, 10vw, 140px)',
        paddingLeft:     'var(--page-margin)',
        paddingRight:    'var(--page-margin)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}>
        <p
          style={{
            fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:      '10px',
            fontWeight:    500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         '#D91C1C',
            marginBottom:  '16px',
          }}
        >
          INSPIRED
        </p>
        <div
          aria-hidden="true"
          style={{
            height:          '1px',
            width:           '100%',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          style={{
            columns:   'clamp(140px, 22vw, 280px)',
            gap:       'clamp(6px, 1vw, 12px)',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                breakInside:     'avoid',
                marginBottom:    'clamp(6px, 1vw, 12px)',
                paddingTop:      `${90 + Math.random() * 60}%`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                animation:       'shimmer 1.6s ease-in-out infinite',
                animationDelay:  `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Masonry grid */}
      {!loading && images.length > 0 && (
        <div
          style={{
            columns: 'clamp(140px, 22vw, 280px)',
            gap:     'clamp(6px, 1vw, 12px)',
          }}
        >
          {images.map(pin => (
            <PinCard key={pin.id} pin={pin} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
      `}</style>
    </section>
  )
}
