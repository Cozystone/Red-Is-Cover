'use client'

/* AdminDoor — 비밀 관리자 입장 씬
   클릭 처리: R3F가 아닌 DOM div에서 전담 (신뢰성 보장)
   - div 클릭 → 문 열기
   - 문 열린 후 div 클릭 → closeSignal 증가 → DoorScene이 역재생 */

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/lib/adminContext'
import { useGun } from '@/lib/gunContext'

const DoorScene = dynamic(() => import('./AdminDoorScene'), { ssr: false })

const HV = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function AdminDoor() {
  const { loginAdmin } = useAdmin()
  const { resetGun }   = useGun()

  const [doorClicked,   setDoorClicked]   = useState(false)
  const [doorOpen,      setDoorOpen]      = useState(false)
  const [canVisible,    setCanVisible]    = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [closeSignal,   setCloseSignal]   = useState(0)
  const [canKey,        setCanKey]        = useState(0)
  const [password,      setPassword]      = useState('')
  const [shake,         setShake]         = useState(false)
  const [fadeOut,       setFadeOut]       = useState(false)
  const inputRef     = useRef<HTMLInputElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // doorOpen → can slides in → dialog appears
  useEffect(() => {
    if (!doorOpen) return
    const t1 = setTimeout(() => setCanVisible(true),    300)
    const t2 = setTimeout(() => setDialogVisible(true), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [doorOpen])

  useEffect(() => {
    if (dialogVisible) setTimeout(() => inputRef.current?.focus(), 100)
  }, [dialogVisible])

  // Reset state after reverse animation completes
  const handleClose = () => {
    closeTimerRef.current = null
    setCanVisible(false)
    setDialogVisible(false)
    setTimeout(() => {
      setDoorOpen(false)
      setDoorClicked(false)
      setCanKey(n => n + 1) // remount SoupCan so second open starts fresh
    }, 100)
  }

  // DOM-level click handler for the entire scene area
  const handleSectionClick = (e: React.MouseEvent) => {
    // Ignore clicks that originated inside the password dialog
    if ((e.target as HTMLElement).closest('[data-role="dialog"]')) return

    if (!doorClicked) {
      setDoorClicked(true)
      return
    }
    if (doorOpen) {
      if (closeTimerRef.current) return // 이미 닫히는 중 → 무시
      setDialogVisible(false)
      setCanVisible(false)
      // 캔이 문 뒤로 충분히 들어간 후(900ms) 문 닫기
      closeTimerRef.current = setTimeout(() => setCloseSignal(n => n + 1), 900)
    }
  }

  const handleSubmit = () => {
    if (loginAdmin(password)) {
      setFadeOut(true)
      setTimeout(() => {
        resetGun()
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }, 400)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setPassword('')
    }
  }

  return (
    <section
      aria-hidden="true"
      style={{
        position:        'relative',
        backgroundColor: '#0a0a0a',
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        overflow:        'hidden',
        cursor:          doorOpen ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence>
        {fadeOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: '#0a0a0a', zIndex: 50 }}
          />
        )}
      </AnimatePresence>

      {!doorClicked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            fontFamily: HV, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.12)', pointerEvents: 'none', whiteSpace: 'nowrap',
          }}
        >
          — Restricted Entry —
        </motion.p>
      )}

      {/* Click area — covers entire section except dialog */}
      <div
        onClick={handleSectionClick}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />

      {/* 3D Scene — behind click area, no R3F click events */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <DoorScene
          doorClicked={doorClicked}
          doorOpen={doorOpen}
          canVisible={canVisible}
          canKey={canKey}
          closeSignal={closeSignal}
          onDoorOpen={() => setDoorOpen(true)}
          onClose={handleClose}
        />
      </div>

      {/* Password dialog — above click area */}
      <AnimatePresence>
        {dialogVisible && (
          <motion.div
            data-role="dialog"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, textAlign: 'center',
            }}
          >
            <p style={{
              fontFamily: HV, fontSize: 'clamp(14px, 2vw, 20px)', fontWeight: 300,
              letterSpacing: '0.12em', color: 'rgba(255,255,255,0.9)',
              marginBottom: '20px', textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}>
              What&apos;s The Password?
            </p>

            <motion.div
              animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
            >
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="···"
                style={{
                  fontFamily: HV, fontSize: '14px', letterSpacing: '0.2em',
                  color: '#202124', backgroundColor: 'rgba(255,255,255,0.95)',
                  border: shake ? '2px solid #D91C1C' : '2px solid transparent',
                  borderRadius: '4px', padding: '10px 18px', outline: 'none',
                  width: '220px', textAlign: 'center', transition: 'border-color 0.2s',
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  fontFamily: HV, fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#fff', backgroundColor: '#D91C1C',
                  border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer',
                }}
              >
                Enter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
