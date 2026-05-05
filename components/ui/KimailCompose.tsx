'use client'

/* KimailCompose — Gmail 스타일 메시지 작성 패널
   Supabase messages 테이블에 저장 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabase } from '@/lib/supabase'

const HV = '"Helvetica Neue", Helvetica, Arial, sans-serif'

interface Props {
  onClose: () => void
}

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export default function KimailCompose({ onClose }: Props) {
  const [fromName, setFromName] = useState('')
  const [subject,  setSubject]  = useState('')
  const [body,     setBody]     = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const [minimized, setMinimized] = useState(false)

  const handleSend = async () => {
    if (!fromName.trim() || !body.trim()) return
    setSendState('sending')
    try {
      const sb = getSupabase()
      if (sb) {
        const { error } = await sb.from('messages').insert({
          from_name: fromName.trim(),
          subject:   subject.trim() || '(No Subject)',
          body:      body.trim(),
        })
        if (error) throw error
      }
      setSendState('sent')
      setTimeout(() => { setSendState('idle'); onClose() }, 2000)
    } catch {
      setSendState('error')
      setTimeout(() => setSendState('idle'), 3000)
    }
  }

  const fieldStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #e0e0e0',
    padding: '10px 16px',
    fontFamily: HV,
    fontSize: '13px',
    color: '#202124',
    backgroundColor: 'transparent',
    outline: 'none',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position:     'fixed',
        bottom:       0,
        right:        'clamp(16px, 3vw, 48px)',
        width:        'min(480px, calc(100vw - 32px))',
        backgroundColor: '#fff',
        borderRadius: '8px 8px 0 0',
        boxShadow:    '0 8px 40px rgba(0,0,0,0.28)',
        zIndex:       500,
        overflow:     'hidden',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#404040',
        padding:         '10px 16px',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        cursor:          'default',
        userSelect:      'none',
      }}>
        <span style={{ fontFamily: HV, fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          Kimail — New Message
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setMinimized(m => !m)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1,
              padding: '2px 6px',
            }}
            aria-label="Minimize"
          >
            {minimized ? '▲' : '─'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1,
              padding: '2px 6px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            {/* ── Form fields ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ fontFamily: HV, fontSize: '12px', color: '#9aa0a6', padding: '0 0 0 16px', flexShrink: 0 }}>
                From
              </span>
              <input
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                placeholder="Your name"
                style={{ ...fieldStyle, borderBottom: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ fontFamily: HV, fontSize: '12px', color: '#9aa0a6', padding: '0 0 0 16px', flexShrink: 0 }}>
                To
              </span>
              <span style={{ ...fieldStyle, borderBottom: 'none', color: '#5f6368', cursor: 'default' }}>
                anseokkim@gmail.com
              </span>
            </div>

            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              style={fieldStyle}
            />

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message..."
              style={{
                ...fieldStyle,
                borderBottom: 'none',
                height:       '200px',
                resize:       'none',
                display:      'block',
                padding:      '14px 16px',
                lineHeight:   1.6,
              }}
            />

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div style={{
              padding:        '12px 16px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              borderTop:      '1px solid #e0e0e0',
            }}>
              <button
                onClick={handleSend}
                disabled={sendState === 'sending' || sendState === 'sent'}
                style={{
                  fontFamily:      HV,
                  fontSize:        '13px',
                  fontWeight:      600,
                  letterSpacing:   '0.06em',
                  color:           '#fff',
                  backgroundColor: sendState === 'sent' ? '#34A853' : sendState === 'error' ? '#EA4335' : '#1a73e8',
                  border:          'none',
                  borderRadius:    '4px',
                  padding:         '8px 24px',
                  cursor:          sendState === 'idle' ? 'pointer' : 'default',
                  transition:      'background-color 0.2s',
                }}
              >
                {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? '✓ Sent' : sendState === 'error' ? 'Error — retry' : 'Send'}
              </button>

              <span style={{ fontFamily: HV, fontSize: '11px', color: '#9aa0a6' }}>
                {sendState === 'idle' && !fromName && 'Fill in your name to send'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
