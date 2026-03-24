'use client'

// KeychainCanvas — horizontal rail with glass keychains hanging down
// Camera: (0, 0.5, 7), FOV 52
// Visible Y at Z=0: 0.5 ± tan(26°)*7 ≈ [-2.9, +3.9]
// Rail at Y=3.3, keychains hang to Y≈1.4 center → all visible

import { useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGun } from '@/lib/gunContext'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'WORLD',   color: '#D91C1C', textColor: '#ffffff', href: '#world'   },
  { label: 'WORK',    color: '#C9B55A', textColor: '#1a1a1a', href: '#work'    },
  { label: 'ARCHIVE', color: '#6a6a72', textColor: '#ffffff', href: '#archive' },
  { label: 'ABOUT',   color: '#F0EBE3', textColor: '#111111', href: '#about'   },
  { label: 'CONTACT', color: '#A8C8D8', textColor: '#111111', href: '#contact' },
  { label: 'GUN',     color: '#D91C1C', textColor: '#ffffff', href: null       },
] as const

const N = NAV_ITEMS.length

// Layout: keychains span X from -HALF_SPAN to +HALF_SPAN
// Spaced 3.2 units apart so on narrower screens some hang off-edge (scrollable)
const SPACING   = 3.2
const HALF_SPAN = (SPACING * (N - 1)) / 2   // = 8
const RAIL_Y    = 3.3   // Y position of horizontal rail
const ARM       = 0.55  // wire length above keychain body
const KW        = 1.25  // keychain width
const KH        = 1.65  // keychain height
const KD        = 0.09  // keychain depth

// ── Text texture ──────────────────────────────────────────────────────────────

function makeText(label: string, textColor: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 128)
  ctx.font         = 'bold 48px "Helvetica Neue", Helvetica, Arial, sans-serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = textColor
  ctx.fillText(label, 128, 64)
  return new THREE.CanvasTexture(c)
}

// ── Horizontal rail ───────────────────────────────────────────────────────────

function Rail() {
  // Rail extends well past keychain span for visual continuity
  const len = HALF_SPAN * 2 + 8
  return (
    <mesh position={[0, RAIL_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.045, 0.045, len, 12]} />
      <meshStandardMaterial color="#c4c4cc" metalness={0.95} roughness={0.12} />
    </mesh>
  )
}

// ── Single keychain pendulum ──────────────────────────────────────────────────

interface PendulumProps {
  index:  number
  onNav:  (idx: number, clientX: number, clientY: number) => void
}

function Pendulum({ index, onNav }: PendulumProps) {
  const item   = NAV_ITEMS[index]
  const ref    = useRef<THREE.Group>(null)
  const angle  = useRef((Math.random() - 0.5) * 0.05)
  const angVel = useRef(0)
  const prevMX = useRef<number | null>(null)

  // X position along the rail
  const x = -HALF_SPAN + SPACING * index

  const COM = ARM + KH / 2
  const w2  = 9.81 / COM

  const texture = useMemo(
    () => makeText(item.label, item.textColor),
    [item.label, item.textColor]
  )

  useFrame((_, dt) => {
    const safe = Math.min(dt, 0.033)
    angVel.current += -w2 * angle.current * safe
    angVel.current *= Math.pow(0.94, safe * 60)
    angle.current  += angVel.current * safe
    angle.current   = Math.max(-0.5, Math.min(0.5, angle.current))
    if (ref.current) ref.current.rotation.z = angle.current
  })

  const onMove = useCallback((e: any) => {
    const mx = e.nativeEvent?.clientX ?? null
    if (mx !== null && prevMX.current !== null) {
      const vx = (mx - prevMX.current) / window.innerWidth * 2
      if (Math.abs(vx) > 0.001) angVel.current += vx * 8
    }
    prevMX.current = mx
  }, [])

  const onLeave = useCallback(() => { prevMX.current = null }, [])

  const onClick = useCallback((e: any) => {
    e.stopPropagation()
    onNav(index, e.nativeEvent?.clientX ?? window.innerWidth / 2, e.nativeEvent?.clientY ?? 24)
  }, [index, onNav])

  return (
    <group ref={ref} position={[x, RAIL_Y, 0]}>
      {/* Small loop ring hooking onto the rail */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.11, 0.02, 8, 24]} />
        <meshStandardMaterial color="#c4c4cc" metalness={1} roughness={0.15} />
      </mesh>

      {/* Thin wire */}
      <mesh position={[0, -(ARM * 0.5 + 0.11), 0]}>
        <cylinderGeometry args={[0.009, 0.009, ARM, 6]} />
        <meshStandardMaterial color="#a8a8b8" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Glass body */}
      <mesh
        position      ={[0, -(ARM + KH / 2 + 0.11), 0]}
        onPointerMove ={onMove}
        onPointerLeave={onLeave}
        onClick       ={onClick}
      >
        <boxGeometry args={[KW, KH, KD]} />
        <meshPhysicalMaterial
          color       ={item.color}
          metalness   ={0.02}
          roughness   ={0.06}
          transmission={0.75}
          thickness   ={0.45}
          ior         ={1.5}
          transparent
          side        ={THREE.DoubleSide}
        />
      </mesh>

      {/* Text front */}
      <mesh position={[0, -(ARM + KH / 2 + 0.11), KD / 2 + 0.005]}>
        <planeGeometry args={[KW * 1.05, KH * 0.52]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>

      {/* Text back */}
      <mesh position={[0, -(ARM + KH / 2 + 0.11), -(KD / 2 + 0.005)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[KW * 1.05, KH * 0.52]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene() {
  const { activate } = useGun()
  const { gl }       = useThree()
  const groupRef     = useRef<THREE.Group>(null)
  const scrollTarget = useRef(0)
  const scrollCur    = useRef(0)
  const MAX_SCROLL   = 4.5   // units each side

  // Mouse-wheel scrolls the keychain group left/right
  useEffect(() => {
    const canvas = gl.domElement
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollTarget.current -= (e.deltaX + e.deltaY) * 0.008
      scrollTarget.current  = Math.max(-MAX_SCROLL, Math.min(MAX_SCROLL, scrollTarget.current))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [gl])

  useFrame((_, dt) => {
    scrollCur.current += (scrollTarget.current - scrollCur.current) * Math.min(dt * 8, 1)
    if (groupRef.current) groupRef.current.position.x = scrollCur.current
  })

  const handleNav = useCallback((idx: number, clientX: number, clientY: number) => {
    const item = NAV_ITEMS[idx]
    if (item.label === 'GUN') {
      activate(clientX, clientY)
    } else if (item.href) {
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activate])

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 10]} intensity={3.0} />
      <directionalLight position={[-6, -2, 6]}  intensity={0.8} color="#aaddff" />

      <group ref={groupRef}>
        <Rail />
        {NAV_ITEMS.map((_, i) => (
          <Pendulum key={i} index={i} onNav={handleNav} />
        ))}
      </group>
    </>
  )
}

// ── Canvas export ─────────────────────────────────────────────────────────────

export default function KeychainCanvas() {
  return (
    <Canvas
      gl={{
        alpha:               true,
        antialias:           true,
        powerPreference:     'high-performance',
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      camera={{ position: [0, 0.5, 7], fov: 52 }}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  )
}
