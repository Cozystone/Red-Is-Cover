'use client'

/* PhoneCallScene — white gallery: scattered vintage sign collage + Canon AT-1 3D model.
   Signs cycle slowly. Camera auto-rotates; drag to orbit. 챠우챠우 inst on loop. */

import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
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

interface SignDef {
  id: number
  src: string
  left: number    // % of container width
  top: number     // % of container height
  rot: number     // deg
  scale: number
  opacity: number
}

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

/** Initial placement: even 5×4 grid with jitter so every sign is unique image */
function makeInitialDef(id: number): SignDef {
  const COLS = 5, ROWS = 4
  const cw = 100 / COLS, ch = 100 / ROWS
  return {
    id,
    src: SIGN_SRCS[id % SIGN_SRCS.length],
    left: (id % COLS) * cw + rand(cw * 0.12, cw * 0.88),
    top:  Math.floor(id / COLS) * ch + rand(ch * 0.12, ch * 0.88),
    rot:  rand(-30, 30),
    scale: rand(0.48, 1.08),
    opacity: rand(0.15, 0.46),
  }
}

/** Random replacement for cycling */
function makeRandomDef(id: number): SignDef {
  return {
    id,
    src: SIGN_SRCS[Math.floor(Math.random() * SIGN_SRCS.length)],
    left: rand(3, 97),
    top:  rand(3, 92),
    rot:  rand(-30, 30),
    scale: rand(0.48, 1.08),
    opacity: rand(0.15, 0.46),
  }
}

// ── Sign item — manages its own fade lifecycle ────────────────────────────────

interface SignItemProps { def: SignDef; delay: number }

function SignItem({ def, delay }: SignItemProps) {
  const [current, setCurrent] = useState(def)
  const [visible, setVisible] = useState(false)
  const mounted = useRef(false)

  // Staggered initial fade-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // On def change: fade out → update → fade in
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    setVisible(false)
    const t = setTimeout(() => { setCurrent(def); setVisible(true) }, 900)
    return () => clearTimeout(t)
  }, [def.src, def.left, def.top, def.rot]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current.src}
      alt=""
      draggable={false}
      style={{
        position:      'absolute',
        left:          `${current.left}%`,
        top:           `${current.top}%`,
        transform:     `translate(-50%, -50%) rotate(${current.rot}deg) scale(${current.scale})`,
        maxWidth:      'clamp(70px, 9.5vw, 152px)',
        maxHeight:     'clamp(70px, 18vh, 210px)',
        width:         'auto',
        height:        'auto',
        opacity:       visible ? current.opacity : 0,
        transition:    'opacity 0.9s ease',
        pointerEvents: 'none',
        userSelect:    'none',
      }}
    />
  )
}

// ── 3D Canon AT-1 camera ──────────────────────────────────────────────────────

function CameraModel() {
  const { scene } = useGLTF('/canon_camera.glb')

  const obj = useMemo(() => {
    const cloned = scene.clone(true)

    // Fix materials: opaque exterior only, no see-through
    cloned.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = c.receiveShadow = true
        const mats = Array.isArray(c.material) ? c.material : [c.material]
        mats.forEach((m, idx) => {
          const mat = (m as THREE.MeshStandardMaterial).clone()
          mat.side        = THREE.FrontSide
          mat.transparent = false
          mat.opacity     = 1
          mat.depthWrite  = true
          mat.alphaTest   = 0
          mat.needsUpdate = true
          if (Array.isArray(c.material)) (c.material as THREE.Material[])[idx] = mat
          else c.material = mat
        })
      }
    })

    // Fit to ~1.8 units across the longest axis, centred at origin
    const box  = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const s    = 1.8 / (Math.max(size.x, size.y, size.z) || 1)
    cloned.scale.setScalar(s)
    cloned.updateMatrixWorld(true)
    const box2   = new THREE.Box3().setFromObject(cloned)
    const center = box2.getCenter(new THREE.Vector3())
    cloned.position.sub(center)

    return cloned
  }, [scene])

  return <primitive object={obj} />
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

const TOTAL = 20

export default function PhoneCallScene({ onClose }: Props) {
  const [defs, setDefs] = useState<SignDef[]>(() =>
    Array.from({ length: TOTAL }, (_, i) => makeInitialDef(i))
  )

  // 챠우챠우 background music
  useEffect(() => {
    const music = new Audio('/chowchow.mp3')
    music.loop   = true
    music.volume = 0.75
    music.play().catch(() => {})
    return () => { music.pause(); music.src = '' }
  }, [])

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Cycle 2–3 random signs every ~2.8 s
  useEffect(() => {
    const id = setInterval(() => {
      setDefs(prev => {
        const count = 2 + Math.floor(Math.random() * 2)
        const picks = Array.from({ length: prev.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
        return prev.map((d, i) => picks.includes(i) ? makeRandomDef(d.id) : d)
      })
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return createPortal(
    <div style={{
      position:   'fixed',
      inset:      0,
      zIndex:     9002,
      background: '#f8f8f6',
      animation:  'pcFadeIn 0.8s ease-out forwards',
      overflow:   'hidden',
    }}>

      {/* ── Vintage sign collage ─────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {defs.map((def, i) => (
          <SignItem key={def.id} def={def} delay={40 + i * 65} />
        ))}
      </div>

      {/* ── 3D camera canvas (transparent, centred) ──────────────────── */}
      <div style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        pointerEvents:  'none',
      }}>
        <div style={{
          width:              'min(60vw, 64vh)',
          height:             'min(54vw, 58vh)',
          pointerEvents:      'auto',
          backgroundImage:    'url(/seoul-night.jpg)',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          borderRadius:       '2px',
          overflow:           'hidden',
        }}>
          <Canvas
            camera={{ position: [0, 0.15, 3.0], fov: 40 }}
            gl={{
              antialias:           true,
              alpha:               true,
              toneMapping:         THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
            style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
          >
            {/* Three-point lighting suited to a dark matte camera body */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[-4, 6, 5]}  intensity={3.2} color="#fff8f0" />
            <directionalLight position={[5, 2, -4]}  intensity={1.3} color="#d0e4ff" />
            <directionalLight position={[0, -2, 3]}  intensity={0.5} color="#ffffff" />

            <Suspense fallback={null}>
              <CameraModel />
              <Environment preset="studio" />
            </Suspense>

            <OrbitControls
              autoRotate
              autoRotateSpeed={1.4}
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI * 4 / 5}
            />
          </Canvas>
        </div>
      </div>

      {/* ── ESC / close ──────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position:      'absolute',
          top:           'clamp(20px,3vh,36px)',
          right:         'clamp(20px,3vw,36px)',
          fontFamily:    "'Helvetica Neue',sans-serif",
          fontSize:      '9px',
          fontWeight:    500,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color:         'rgba(0,0,0,0.35)',
          cursor:        'pointer',
          userSelect:    'none',
          padding:       '12px',
          zIndex:        1,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.35)' }}
      >
        ESC · Close
      </div>

      <style>{`
        @keyframes pcFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>,
    document.body
  )
}
