'use client'

/* AdminDoor — Profile(05)과 Contact(06) 사이의 비밀 관리자 입장 씬
   문 클릭 → 애니메이션 → Campbell 캔 등장 → 비밀번호 입력 */

import { useState, useRef, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/lib/adminContext'

const DoorScene = dynamic(() => import('./AdminDoorScene'), { ssr: false })

const HV = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function AdminDoor() {
  const { loginAdmin } = useAdmin()
  const [doorClicked, setDoorClicked]   = useState(false)
  const [doorOpen,    setDoorOpen]      = useState(false)
  const [canVisible,  setCanVisible]    = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [password,    setPassword]      = useState('')
  const [shake,       setShake]         = useState(false)
  const [fadeOut,     setFadeOut]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sequence: doorOpen → can slides in → dialog appears
  useEffect(() => {
    if (!doorOpen) return
    const t1 = setTimeout(() => setCanVisible(true), 200)
    const t2 = setTimeout(() => setDialogVisible(true), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [doorOpen])

  useEffect(() => {
    if (dialogVisible) setTimeout(() => inputRef.current?.focus(), 100)
  }, [dialogVisible])

  const handleSubmit = () => {
    if (loginAdmin(password)) {
      setFadeOut(true)
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 400)
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
      }}
    >
      {/* Fade-out overlay on success */}
      <AnimatePresence>
        {fadeOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: '#0a0a0a', zIndex: 50 }}
          />
        )}
      </AnimatePresence>

      {/* Subtle top label */}
      {!doorClicked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{
            position:      'absolute',
            top:           '10%',
            left:          '50%',
            transform:     'translateX(-50%)',
            fontFamily:    HV,
            fontSize:      '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.12)',
            pointerEvents: 'none',
            whiteSpace:    'nowrap',
          }}
        >
          — Restricted Entry —
        </motion.p>
      )}

      {/* 3D Scene */}
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <DoorScene
          doorClicked={doorClicked}
          canVisible={canVisible}
          onDoorClick={() => setDoorClicked(true)}
          onDoorOpen={() => setDoorOpen(true)}
        />

        {/* Password dialog — appears after can slides in */}
        <AnimatePresence>
          {dialogVisible && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position:  'absolute',
                bottom:    '10%',
                left:      '50%',
                transform: 'translateX(-50%)',
                zIndex:    10,
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily:    HV,
                fontSize:      'clamp(14px, 2vw, 20px)',
                fontWeight:    300,
                letterSpacing: '0.12em',
                color:         'rgba(255,255,255,0.9)',
                marginBottom:  '20px',
                textShadow:    '0 2px 12px rgba(0,0,0,0.8)',
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
                    fontFamily:      HV,
                    fontSize:        '14px',
                    letterSpacing:   '0.2em',
                    color:           '#202124',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border:          shake ? '2px solid #D91C1C' : '2px solid transparent',
                    borderRadius:    '4px',
                    padding:         '10px 18px',
                    outline:         'none',
                    width:           '220px',
                    textAlign:       'center',
                    transition:      'border-color 0.2s',
                  }}
                />
                <button
                  onClick={handleSubmit}
                  style={{
                    fontFamily:      HV,
                    fontSize:        '11px',
                    fontWeight:      700,
                    letterSpacing:   '0.18em',
                    textTransform:   'uppercase',
                    color:           '#fff',
                    backgroundColor: '#D91C1C',
                    border:          'none',
                    borderRadius:    '4px',
                    padding:         '10px 20px',
                    cursor:          'pointer',
                  }}
                >
                  Enter
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
