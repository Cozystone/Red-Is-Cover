'use client'

/* LiquidOverlay — threejs-components liquid1, loaded via module script.
   GrassField is unmounted before this mounts, so no WebGL context conflict.
   Stir with cursor → fade to white → onComplete. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const STIR_GOAL = 14.0
const AUTO_MS   = 18000

interface Props { onComplete: () => void; bgSnapshot?: string }

export default function LiquidOverlay({ onComplete, bgSnapshot }: Props) {
  const divRef      = useRef<HTMLDivElement>(null)
  const whiteRef    = useRef<HTMLDivElement>(null)
  const hintRef     = useRef<HTMLDivElement>(null)
  const lastPos     = useRef({ x: -1, y: -1 })
  const stirTotal   = useRef(0)
  const completed   = useRef(false)

  const triggerComplete = useRef(() => {
    if (completed.current) return
    completed.current = true
    onComplete()
  })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const script = document.createElement('script')
    script.type = 'module'
    script.id   = '__liquid_script__'
    script.textContent = `
      import LiquidBackground from '/liquid1.min.js';
      (function() {
        const canvas = document.getElementById('__liquid_canvas__');
        if (!canvas) return;
        const app = LiquidBackground(canvas);
        app.liquidPlane.material.color.set(0x111111);
        app.liquidPlane.material.metalness   = 0.75;
        app.liquidPlane.material.roughness   = 0.25;
        app.liquidPlane.uniforms.displacementScale.value = 5;
        app.setRain(false);
        if (app.three && app.three.renderer) {
          app.three.renderer.setClearColor(0x000000, 0);
          app.three.renderer.alpha = true;
        }
        window.__liquidApp__ = app;
      })();
    `
    document.head.appendChild(script)

    const timer = setTimeout(() => triggerComplete.current(), AUTO_MS)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = prev
      document.head.querySelector('#__liquid_script__')?.remove()
      ;(window as any).__liquidApp__?.dispose()
      ;(window as any).__liquidApp__ = null
    }
  }, [])

  const addStir = (delta: number) => {
    stirTotal.current = Math.min(stirTotal.current + delta, STIR_GOAL)
    const progress = stirTotal.current / STIR_GOAL
    if (whiteRef.current) whiteRef.current.style.opacity = String(progress)
    if (hintRef.current)  hintRef.current.style.opacity  = String(Math.max(0, 1 - progress * 2))
    if (stirTotal.current >= STIR_GOAL) triggerComplete.current()
  }

  // Touch
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        addStir(0.08)
        lastPos.current = { x: t.clientX / window.innerWidth, y: t.clientY / window.innerHeight }
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const delta = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (delta > 0.002) addStir(delta * 3.5)
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{
        position:   'fixed', inset: 0, zIndex: 9000, cursor: 'crosshair',
        background: bgSnapshot ? `url(${bgSnapshot}) center/cover no-repeat` : '#000',
      }}
    >
      <canvas
        id="__liquid_canvas__"
        style={{
          display:    'block',
          width:      '100%',
          height:     '100%',
          background: 'transparent',
          animation:  'liqCanvasIn 0.6s ease-out forwards',
        }}
      />

      {/* White overlay — opacity driven by stir progress via ref, starts at 0 */}
      <div
        ref={whiteRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          background:    '#ffffff',
          opacity:       0,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={hintRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'clamp(28px, 5vh, 60px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
          fontSize:      '9px',
          fontWeight:    500,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.6)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          animation:     'liqHint 2.8s ease-in-out infinite',
        }}
      >
        Stir to enter
      </div>

      <style>{`
        @keyframes liqCanvasIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes liqHint {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1.0; }
        }
      `}</style>
    </div>,
    document.body,
  )
}
