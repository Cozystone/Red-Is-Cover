'use client'

// KeychainNav — 3D keychain navigation bar
// Uses @react-three/fiber (same as GunCanvas) for reliable Next.js rendering.

import dynamic from 'next/dynamic'

const KeychainCanvas = dynamic(() => import('./KeychainCanvas'), { ssr: false })

export default function KeychainNav() {
  return (
    <>
      {/* ── 3D canvas container ── fixed at top, 200px tall ─────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          height:        '200px',
          zIndex:        200,
          pointerEvents: 'auto',
        }}
      >
        <KeychainCanvas />

        {/* Fade bottom edge into page */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            bottom:     0,
            left:       0,
            right:      0,
            height:     '70px',
            background: 'linear-gradient(to bottom, transparent, #060606)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Accessible nav for screen readers / crawlers */}
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
