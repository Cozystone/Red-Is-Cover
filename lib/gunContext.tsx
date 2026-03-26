'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

export type GunState = 'idle' | 'dropping' | 'aiming' | 'shattering' | 'revealed'

interface GunCtx {
  gunState:      GunState
  shatterOrigin: { x: number; y: number }
  navButtonPos:  { x: number; y: number }
  curtainOpen:   boolean
  activate:      (clientX: number, clientY: number) => void
  grabGun:       () => void
  fireGun:       () => void
  updateAimPos:  (nx: number, ny: number) => void
  resetGun:      () => void
  openCurtain:   () => void
}

const Ctx = createContext<GunCtx | null>(null)

export function GunProvider({ children }: { children: ReactNode }) {
  const [gunState,      setGunState]      = useState<GunState>('idle')
  const [shatterOrigin, setShatterOrigin] = useState({ x: 0.5, y: 0.5 })
  const [navButtonPos,  setNavButtonPos]  = useState({ x: 0.9, y: 0.03 })
  const [curtainOpen,   setCurtainOpen]   = useState(false)

  const aimPos = useRef({ x: 0.5, y: 0.5 })

  const activate = useCallback((_clientX: number, _clientY: number) => {
    setNavButtonPos({ x: 0.88, y: 0.03 })
    setGunState('dropping')
  }, [])

  const grabGun     = useCallback(() => setGunState('aiming'), [])
  const resetGun    = useCallback(() => setGunState('idle'),   [])
  const openCurtain = useCallback(() => setCurtainOpen(true),  [])

  const updateAimPos = useCallback((nx: number, ny: number) => {
    aimPos.current = { x: nx, y: ny }
  }, [])

  const fireGun = useCallback(() => {
    setShatterOrigin({ ...aimPos.current })
    setGunState('shattering')
    setTimeout(() => setGunState('revealed'), 1800)
  }, [])

  return (
    <Ctx.Provider value={{ gunState, shatterOrigin, navButtonPos, curtainOpen, activate, grabGun, fireGun, updateAimPos, resetGun, openCurtain }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGun() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGun must be inside GunProvider')
  return ctx
}
