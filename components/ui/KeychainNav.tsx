'use client'

import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'
import { useRef } from 'react'

const KeychainCanvas = dynamic(() => import('./KeychainCanvas'), { ssr: false })

export default function KeychainNav() {
  const { activate } = useGun()
  const btnRef = useRef<HTMLAnchorElement>(null)

  return (
    <>
      {/* ── Fixed nav container — 200px ──────────────────────────────────── */}
      <div
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          height:        '200px',
          zIndex:        200,
          pointerEvents: 'none',
        }}
      >
        {/* 3D keychain canvas — full area, transparent bg */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <KeychainCanvas />
        </div>

        {/* Bottom fade into page */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        0,
            left:          0,
            right:         0,
            height:        '60px',
            background:    'linear-gradient(to bottom, transparent, #060606)',
            pointerEvents: 'none',
          }}
        />

        {/* ── RED IS COVER logo — top-left, Helvetica ─────────────────────── */}
        <a
          href="/"
          aria-label="RED IS COVER — Home"
          style={{
            position:       'absolute',
            top:            0,
            left:           'var(--page-margin)',
            height:         '48px',
            display:        'flex',
            alignItems:     'center',
            fontFamily:     "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize:       '11px',
            fontWeight:     500,
            letterSpacing:  '0.22em',
            textTransform:  'uppercase',
            color:          '#FAF8F5',
            textDecoration: 'none',
            pointerEvents:  'auto',
            zIndex:         10,
            textShadow:     '0 1px 8px rgba(0,0,0,0.8)',
          }}
        >
          RED IS COVER
        </a>
      </div>

      {/* Screen-reader nav */}
      <nav
        aria-label="Main navigation"
        style={{ position: 'fixed', top: 0, left: '-9999px', opacity: 0, pointerEvents: 'none' }}
      >
        <a href="#world">WORLD</a>
        <a href="#work">WORK</a>
        <a href="#archive">ARCHIVE</a>
        <a href="#about">ABOUT</a>
        <a href="#contact">CONTACT</a>
      </nav>
    </>
  )
}
