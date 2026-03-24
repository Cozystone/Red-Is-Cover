'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

export type GunState = 'idle' | 'dropping' | 'aiming' | 'shattering' | 'revealed'

interface GunCtx {
  gunState:      GunState
  shatterOrigin: { x: number; y: number }
  navButtonPos:  { x: number; y: number }   // normalised 0-1 screen coords
  activate:      (clientX: number, clientY: number) => void
  grabGun:       () => void
  fireGun:       () => void
  updateAimPos:  (nx: number, ny: number) => void  // normalised 0-1 screen coords
}

const Ctx = createContext<GunCtx | null>(null)

export function GunProvider({ children }: { children: ReactNode }) {
  const [gunState,      setGunState]      = useState<GunState>('idle')
  const [shatterOrigin, setShatterOrigin] = useState({ x: 0.5, y: 0.5 })
  const [navButtonPos,  setNavButtonPos]  = useState({ x: 0.9, y: 0.03 })

  // Tracks the gun's actual screen position (updated every frame during aiming)
  const aimPos = useRef({ x: 0.5, y: 0.5 })

  const activate = useCallback((clientX: number, clientY: number) => {
    setNavButtonPos({
      x: clientX / window.innerWidth,
      y: clientY / window.innerHeight,
    })
    setGunState('dropping')
  }, [])

  const grabGun = useCallback(() => setGunState('aiming'), [])

  const updateAimPos = useCallback((nx: number, ny: number) => {
    aimPos.current = { x: nx, y: ny }
  }, [])

  // fireGun uses the gun's tracked position — not the click coordinate
  const fireGun = useCallback(() => {
    setShatterOrigin({ ...aimPos.current })
    setGunState('shattering')
    // Landing is now positioned behind VideoHero (same viewport) —
    // no scroll needed; VideoHero simply fades out to reveal it.
    setTimeout(() => setGunState('revealed'), 1800)
  }, [])

  return (
    <Ctx.Provider value={{ gunState, shatterOrigin, navButtonPos, activate, grabGun, fireGun, updateAimPos }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGun() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGun must be inside GunProvider')
  return ctx
}
