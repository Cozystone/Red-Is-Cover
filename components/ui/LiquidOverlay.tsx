'use client'

/* LiquidOverlay — threejs-components liquid1 effect, transparent over grass.
   Loaded via module script (bypasses webpack to avoid bundled-Three conflict).
   Stir with cursor to accumulate progress; onComplete fires at STIR_GOAL or AUTO_MS. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const STIR_GOAL = 14.0
const AUTO_MS   = 18000

interface Props { onComplete: () => void }

export default function LiquidOverlay({ onComplete }: Props) {
  const divRef      = useRef<HTMLDivElement>(null)
  const lastPos     = useRef({ x: -1, y: -1 })
  const stirTotal   = useRef(0)
  const completed   = useRef(false)

  useEffect(() => {
    // Lock body scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Inject module script — loads liquid1 from public/, runs independently of webpack
    const script = document.createElement('script')
    script.type  = 'module'
    script.id    = '__liquid_script__'
    script.textContent = `
      import LiquidBackground from '/liquid1.min.js';
      (function() {
        const canvas = document.getElementById('__liquid_canvas__');
        if (!canvas) return;
        const app = LiquidBackground(canvas);
        app.liquidPlane.material.transparent = true;
        app.liquidPlane.material.opacity     = 0.28;
        app.liquidPlane.material.metalness   = 0.95;
        app.liquidPlane.material.roughness   = 0.05;
        app.liquidPlane.uniforms.displacementScale.value = 5;
        app.setRain(false);
        if (app.three && app.three.renderer) {
          app.three.renderer.setClearColor(0x000000, 0);
        }
        window.__liquidApp__ = app;
      })();
    `
    document.head.appendChild(script)

    // Fallback auto-complete
    const timer = setTimeout(() => {
      if (!completed.current) { completed.current = true; onComplete() }
    }, AUTO_MS)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = prevOverflow
      document.head.querySelector('#__liquid_script__')?.remove()
      ;(window as any).__liquidApp__?.dispose()
      ;(window as any).__liquidApp__ = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Touch (passive:false to preventDefault)
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        stirTotal.current = Math.min(stirTotal.current + 0.08, STIR_GOAL)
        lastPos.current = { x: t.clientX / window.innerWidth, y: t.clientY / window.innerHeight }
      }
      if (!completed.current && stirTotal.current >= STIR_GOAL) {
        completed.current = true; onComplete()
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const delta = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (delta > 0.002) {
        stirTotal.current = Math.min(stirTotal.current + delta * 3.5, STIR_GOAL)
        if (!completed.current && stirTotal.current >= STIR_GOAL) {
          completed.current = true; onComplete()
        }
      }
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, cursor: 'crosshair' }}
    >
      <canvas
        id="__liquid_canvas__"
        style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
      />

      <div
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
          color:         'rgba(255,255,255,0.45)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          animation:     'liqHint 2.8s ease-in-out infinite',
        }}
      >
        Stir to enter
      </div>

      <style>{`
        @keyframes liqHint {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.9;  }
        }
      `}</style>
    </div>,
    document.body,
  )
}
