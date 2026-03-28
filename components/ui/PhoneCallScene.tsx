'use client'

/* PhoneCallScene — full-screen Seoul night bg + sign collage + Canon AT-1.
   Click camera (no drag) → viewfinder mode.  Drag in viewfinder → pan image.
   ESC/close → hang-up sound + return to idle.  챠우챠우 inst on loop. */

import { useEffect, useRef, useState, useMemo, Suspense, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ── Sign assets ───────────────────────────────────────────────────────────────

const SIGN_SRCS = [
  '/signs/20260327_232611.png',
  '/signs/20260327_232635.png',
  '/signs/20260327_232646.png',
  '/signs/20260327_232651.png',
  '/signs/20260327_232657.png',
  '/signs/20260327_232705.png',
  '/signs/20260327_232711.png',
  '/signs/20260327_234007.png',
  '/signs/20260327_234019.png',
  '/signs/20260327_234028.png',
  '/signs/20260327_234037.png',
  '/signs/20260327_234046.png',
  '/signs/20260327_234055.png',
  '/signs/20260327_234105.png',
  '/signs/20260327_234115.png',
  '/signs/20260327_234123.png',
  '/signs/20260328_013408.png',
  '/signs/20260328_013416.png',
  '/signs/20260328_013422.png',
  '/signs/20260328_013429.png',
]

useGLTF.preload('/canon_camera.glb')

// ── Types / helpers ───────────────────────────────────────────────────────────

type Mode = 'normal' | 'viewfinder'

interface SignDef {
  id: number; src: string
  left: number; top: number; rot: number; scale: number; opacity: number
}

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

function makeInitialDef(id: number): SignDef {
  const COLS = 5, ROWS = 4, cw = 100 / COLS, ch = 100 / ROWS
  return {
    id, src: SIGN_SRCS[id % SIGN_SRCS.length],
    left: (id % COLS) * cw + rand(cw * 0.12, cw * 0.88),
    top:  Math.floor(id / COLS) * ch + rand(ch * 0.12, ch * 0.88),
    rot: rand(-30, 30), scale: rand(0.5, 1.1), opacity: rand(0.22, 0.58),
  }
}

function makeRandomDef(id: number): SignDef {
  return {
    id, src: SIGN_SRCS[Math.floor(Math.random() * SIGN_SRCS.length)],
    left: rand(3, 97), top: rand(3, 92),
    rot: rand(-30, 30), scale: rand(0.5, 1.1), opacity: rand(0.22, 0.58),
  }
}

// ── Sign item ─────────────────────────────────────────────────────────────────

function SignItem({ def, delay }: { def: SignDef; delay: number }) {
  const [current, setCurrent] = useState(def)
  const [visible,  setVisible]  = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    setVisible(false)
    const t = setTimeout(() => { setCurrent(def); setVisible(true) }, 900)
    return () => clearTimeout(t)
  }, [def.src, def.left, def.top, def.rot]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={current.src} alt="" draggable={false} style={{
      position: 'absolute',
      left: `${current.left}%`, top: `${current.top}%`,
      transform: `translate(-50%,-50%) rotate(${current.rot}deg) scale(${current.scale})`,
      maxWidth: 'clamp(70px,9.5vw,152px)', maxHeight: 'clamp(70px,18vh,210px)',
      width: 'auto', height: 'auto',
      opacity: visible ? current.opacity : 0, transition: 'opacity 0.9s ease',
      pointerEvents: 'none', userSelect: 'none',
    }} />
  )
}

// ── 3D Canon AT-1 ─────────────────────────────────────────────────────────────

function CameraModel({
  onCameraClick,
  isDraggingRef,
}: {
  onCameraClick: () => void
  isDraggingRef: { current: boolean }
}) {
  const { scene } = useGLTF('/canon_camera.glb')

  const obj = useMemo(() => {
    const cloned = scene.clone(true)

    cloned.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = c.receiveShadow = true
        const mats = Array.isArray(c.material) ? c.material : [c.material]
        mats.forEach((m, idx) => {
          const mat = (m as THREE.MeshStandardMaterial).clone()
          mat.side = THREE.FrontSide
          mat.transparent = false; mat.opacity = 1
          mat.depthWrite = true; mat.alphaTest = 0; mat.needsUpdate = true
          if (Array.isArray(c.material)) (c.material as THREE.Material[])[idx] = mat
          else c.material = mat
        })
      }
    })

    const box  = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const s    = 1.8 / (Math.max(size.x, size.y, size.z) || 1)
    cloned.scale.setScalar(s)
    cloned.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(cloned)
    cloned.position.sub(box2.getCenter(new THREE.Vector3()))

    return cloned
  }, [scene])

  return (
    <primitive
      object={obj}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(e: any) => {
        if (!isDraggingRef.current) { e.stopPropagation(); onCameraClick() }
      }}
      onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { document.body.style.cursor = '' }}
    />
  )
}

// ── Viewfinder overlay ────────────────────────────────────────────────────────

interface VFProps {
  viewOffset: { x: number; y: number }
  onPtrDown:  (e: React.PointerEvent) => void
  onPtrMove:  (e: React.PointerEvent) => void
  onPtrUp:    () => void
  onExit:     () => void
}

function ViewfinderOverlay({ viewOffset, onPtrDown, onPtrMove, onPtrUp, onExit }: VFProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9010,
        background: 'rgba(6,5,4,0.97)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'crosshair',
        animation: 'vfIn 0.4s ease-out forwards',
      }}
      onPointerDown={onPtrDown}
      onPointerMove={onPtrMove}
      onPointerUp={onPtrUp}
      onPointerCancel={onPtrUp}
    >
      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 65% at center, transparent 20%, rgba(0,0,0,0.72) 90%)',
      }} />

      {/* Viewfinder housing */}
      <div style={{
        position: 'relative',
        padding: '14px 14px 20px',
        background: 'linear-gradient(180deg,#1c1916 0%,#110e0c 100%)',
        borderRadius: '4px',
        boxShadow: '0 0 0 1px rgba(255,180,60,0.07), 0 0 0 5px rgba(0,0,0,0.6), 0 30px 90px rgba(0,0,0,0.92)',
      }}>
        {/* Eyepiece rubber ring */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translate(-50%,-55%)',
          width: '44px', height: '14px',
          background: 'radial-gradient(ellipse,#2e2a27 0%,#1a1714 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
        }} />

        {/* Viewport */}
        <div style={{
          width: 'min(68vw, calc(64vh * 1.47))',
          aspectRatio: '1.47',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,180,60,0.1)',
          borderRadius: '1px',
        }}>
          {/* Seoul night image — vintage treatment */}
          <div style={{
            position: 'absolute',
            top: '-40%', left: '-40%', right: '-40%', bottom: '-40%',
            backgroundImage: 'url(/seoul-night.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translate(${viewOffset.x * 0.42}px,${viewOffset.y * 0.42}px)`,
            filter: 'sepia(0.5) contrast(0.82) brightness(0.48) saturate(0.52)',
          }} />

          {/* Film grain */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='0.14'/%3E%3C/svg%3E")`,
            opacity: 0.65, mixBlendMode: 'overlay',
          }} />

          {/* Inner vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.62) 100%)',
          }} />

          {/* SLR markings */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            viewBox="0 0 300 204" preserveAspectRatio="none"
          >
            {/* Focus circle */}
            <circle cx="150" cy="102" r="20" fill="none" stroke="rgba(255,180,60,0.32)" strokeWidth="0.65"/>
            <circle cx="150" cy="102" r="1.8"  fill="rgba(255,180,60,0.42)"/>
            {/* Corner brackets */}
            <path d="M52,50 L52,70 M52,50 L72,50"   fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
            <path d="M248,50 L248,70 M248,50 L228,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
            <path d="M52,154 L52,134 M52,154 L72,154"   fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
            <path d="M248,154 L248,134 M248,154 L228,154" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
            {/* Horizontal split line (rangefinder patch) */}
            <line x1="130" y1="102" x2="170" y2="102" stroke="rgba(255,180,60,0.18)" strokeWidth="0.5"/>
          </svg>
        </div>

        {/* Info strip — camera HUD */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '9px', paddingLeft: '4px', paddingRight: '4px',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(255,180,60,0.42)', letterSpacing: '0.1em' }}>ASA 400</span>
          <span style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(255,180,60,0.42)', letterSpacing: '0.12em' }}>1/125 · f2.8</span>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,180,60,0.48)' }}>●</span>
        </div>
      </div>

      {/* Exit hint */}
      <div
        onClick={e => { e.stopPropagation(); onExit() }}
        style={{
          position: 'absolute', bottom: 'clamp(18px,3.5vh,44px)',
          left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Helvetica Neue',sans-serif", fontSize: '8px',
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.22)', cursor: 'pointer', whiteSpace: 'nowrap',
          zIndex: 1,
        }}
      >
        ESC · exit viewfinder
      </div>

      <style>{`@keyframes vfIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

const TOTAL = 20

export default function PhoneCallScene({ onClose }: Props) {
  const [mode, setMode]           = useState<Mode>('normal')
  const [defs, setDefs]           = useState<SignDef[]>(() =>
    Array.from({ length: TOTAL }, (_, i) => makeInitialDef(i))
  )
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })

  // Drag-detection refs (canvas level)
  const isDraggingRef   = useRef(false)
  const ptrDownPos      = useRef({ x: 0, y: 0 })

  // Viewfinder drag refs
  const vfDrag = useRef({ active: false, lastX: 0, lastY: 0 })

  // ── 챠우챠우 music ──
  useEffect(() => {
    const music = new Audio('/chowchow.mp3')
    music.loop = true; music.volume = 0.75
    music.play().catch(() => {})
    return () => { music.pause(); music.src = '' }
  }, [])

  // ── Close with hang-up sound ──
  const handleClose = useCallback(() => {
    const snd = new Audio('/phone-hangup.mp3')
    snd.volume = 1.0
    snd.play().catch(() => {})
    onClose()
  }, [onClose])

  // ── ESC ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (mode === 'viewfinder') setMode('normal')
      else handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose, mode])

  // ── Sign cycling ──
  useEffect(() => {
    const id = setInterval(() => {
      setDefs(prev => {
        const count = 2 + Math.floor(Math.random() * 2)
        const picks = Array.from({ length: prev.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5).slice(0, count)
        return prev.map((d, i) => picks.includes(i) ? makeRandomDef(d.id) : d)
      })
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const enterViewfinder = useCallback(() => {
    setMode('viewfinder')
    setViewOffset({ x: 0, y: 0 })
  }, [])

  // ── Viewfinder drag ──
  const handleVfDown = (e: React.PointerEvent) => {
    vfDrag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const handleVfMove = (e: React.PointerEvent) => {
    if (!vfDrag.current.active) return
    const dx = e.clientX - vfDrag.current.lastX
    const dy = e.clientY - vfDrag.current.lastY
    vfDrag.current.lastX = e.clientX; vfDrag.current.lastY = e.clientY
    setViewOffset(prev => ({
      x: Math.max(-200, Math.min(200, prev.x + dx)),
      y: Math.max(-130, Math.min(130, prev.y + dy)),
    }))
  }
  const handleVfUp = () => { vfDrag.current.active = false }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9002,
      background: "url('/seoul-night.jpg') center/cover no-repeat",
      animation: 'pcFadeIn 0.8s ease-out forwards',
      overflow: 'hidden',
    }}>

      {/* ── Sign collage ────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {defs.map((def, i) => (
          <SignItem key={def.id} def={def} delay={40 + i * 65} />
        ))}
      </div>

      {/* ── 3D camera (transparent canvas over bg) ──────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div
          style={{
            width: 'min(60vw, 64vh)', height: 'min(54vw, 58vh)',
            pointerEvents: mode === 'viewfinder' ? 'none' : 'auto',
            opacity: mode === 'viewfinder' ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}
          onPointerDown={e => {
            isDraggingRef.current = false
            ptrDownPos.current = { x: e.clientX, y: e.clientY }
          }}
          onPointerMove={e => {
            const d = Math.hypot(e.clientX - ptrDownPos.current.x, e.clientY - ptrDownPos.current.y)
            if (d > 5) isDraggingRef.current = true
          }}
        >
          <Canvas
            camera={{ position: [0, 0.15, 3.0], fov: 40 }}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[-4, 6, 5]}  intensity={3.2} color="#fff8f0" />
            <directionalLight position={[5, 2, -4]}  intensity={1.3} color="#d0e4ff" />
            <directionalLight position={[0, -2, 3]}  intensity={0.5} />

            <Suspense fallback={null}>
              <CameraModel onCameraClick={enterViewfinder} isDraggingRef={isDraggingRef} />
              <Environment preset="studio" />
            </Suspense>

            <OrbitControls
              autoRotate={mode === 'normal'}
              autoRotateSpeed={1.4}
              enableZoom={false} enablePan={false}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI * 4 / 5}
            />
          </Canvas>
        </div>
      </div>

      {/* ── Viewfinder ──────────────────────────────────────────────── */}
      {mode === 'viewfinder' && (
        <ViewfinderOverlay
          viewOffset={viewOffset}
          onPtrDown={handleVfDown}
          onPtrMove={handleVfMove}
          onPtrUp={handleVfUp}
          onExit={() => setMode('normal')}
        />
      )}

      {/* ── ESC / close (normal mode) ────────────────────────────────── */}
      {mode === 'normal' && (
        <div
          onClick={handleClose}
          style={{
            position: 'absolute', top: 'clamp(20px,3vh,36px)', right: 'clamp(20px,3vw,36px)',
            fontFamily: "'Helvetica Neue',sans-serif", fontSize: '9px', fontWeight: 500,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)', cursor: 'pointer', userSelect: 'none',
            padding: '12px', zIndex: 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.42)' }}
        >
          ESC · Close
        </div>
      )}

      <style>{`@keyframes pcFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>,
    document.body
  )
}
