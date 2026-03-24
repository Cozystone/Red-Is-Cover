'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type GunState = 'idle' | 'dropping' | 'aiming' | 'shattering' | 'revealed'

interface GunCtx {
  gunState:      GunState
  shatterOrigin: { x: number; y: number }
  navButtonPos:  { x: number; y: number }   // normalised 0-1 screen coords
  activate:      (clientX: number, clientY: number) => void
  grabGun:       () => void
  fireGun:       (clientX: number, clientY: number) => void
}

const Ctx = createContext<GunCtx | null>(null)

export function GunProvider({ children }: { children: ReactNode }) {
  const [gunState,      setGunState]      = useState<GunState>('idle')
  const [shatterOrigin, setShatterOrigin] = useState({ x: 0.5, y: 0.5 })
  const [navButtonPos,  setNavButtonPos]  = useState({ x: 0.9, y: 0.03 })

  const activate = useCallback((clientX: number, clientY: number) => {
    setNavButtonPos({
      x: clientX / window.innerWidth,
      y: clientY / window.innerHeight,
    })
    setGunState('dropping')
  }, [])

  const grabGun  = useCallback(() => setGunState('aiming'), [])

  const fireGun = useCallback((clientX: number, clientY: number) => {
    setShatterOrigin({
      x: clientX / window.innerWidth,
      y: clientY / window.innerHeight,
    })
    setGunState('shattering')
    // Scroll to Landing after shatter completes
    setTimeout(() => {
      document.getElementById('landing')?.scrollIntoView({ behavior: 'smooth' })
    }, 900)
    setTimeout(() => setGunState('revealed'), 1800)
  }, [])

  return (
    <Ctx.Provider value={{ gunState, shatterOrigin, navButtonPos, activate, grabGun, fireGun }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGun() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGun must be inside GunProvider')
  return ctx
}
