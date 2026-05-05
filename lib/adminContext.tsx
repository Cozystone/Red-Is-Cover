'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AdminCtx {
  isAdmin:     boolean
  loginAdmin:  (pw: string) => boolean
  logoutAdmin: () => void
}

const Ctx = createContext<AdminCtx | null>(null)

const ADMIN_PASSWORD = 'maurizio cattelan'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const loginAdmin = useCallback((pw: string) => {
    if (pw.trim().toLowerCase() === ADMIN_PASSWORD) {
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const logoutAdmin = useCallback(() => setIsAdmin(false), [])

  return (
    <Ctx.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider')
  return ctx
}
