'use client'

import dynamic from 'next/dynamic'
import { useGun } from '@/lib/gunContext'
import { useEffect, useState } from 'react'

const KeychainCanvas = dynamic(() => import('./KeychainCanvas'), { ssr: false })

export default function KeychainNav() {
  const { gunState, resetGun } = useGun()
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 60) setLogoVisible(true) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (gunState === 'revealed') setLogoVisible(true)
  }, [gunState])

  const handleLogo = (e: React.MouseEvent) => {
    if (gunState === 'revealed') {
      e.preventDefault()
      resetGun()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          height:        'clamp(120px, 20vh, 200px)',
          zIndex:        200,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <KeychainCanvas />
        </div>

        <a
          href="/"
          onClick={handleLogo}
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
            fontWeight:     700,
            letterSpacing:  '0.22em',
            textTransform:  'uppercase',
            color:          '#FAF8F5',
            textDecoration: 'none',
            pointerEvents:  logoVisible ? 'auto' : 'none',
            zIndex:         10,
            textShadow:     '0 1px 8px rgba(0,0,0,0.8)',
            opacity:        logoVisible ? 1 : 0,
            transition:     'opacity 0.6s ease',
          }}
        >
          RED IS COVER
        </a>
      </div>

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
