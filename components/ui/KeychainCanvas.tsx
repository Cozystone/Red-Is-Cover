'use client'

// KeychainCanvas — horizontal rail with glass keychains hanging down
// Camera: (0, 0.5, 7), FOV 52
// Visible Y at Z=0: 0.5 ± tan(26°)*7 ≈ [-2.9, +3.9]
// Rail at Y=3.3, keychains hang to Y≈1.4 center → all visible

import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

// ── Bullet hole texture for GUN keychain after firing ─────────────────────────

function makeBulletHoleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 128)
  const cx = 128, cy = 64

  // Scorched outer ring
  const scorch = ctx.createRadialGradient(cx, cy, 10, cx, cy, 48)
  scorch.addColorStop(0,   'rgba(180,70,0,0.95)')
  scorch.addColorStop(0.35,'rgba(90,20,0,0.70)')
  scorch.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.fillStyle = scorch
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill()

  // Radial cracks
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13)
    ctx.lineTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52)
    ctx.strokeStyle = 'rgba(10,0,0,0.75)'
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  // Bullet hole void
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.88)
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2)
  ctx.fillStyle = '#000'; ctx.fill(); ctx.restore()

  // Bright rim
  const rim = ctx.createRadialGradient(cx, cy, 9, cx, cy, 18)
  rim.addColorStop(0,   'rgba(230,100,0,0.90)')
  rim.addColorStop(0.5, 'rgba(120,30,0,0.55)')
  rim.addColorStop(1,   'transparent')
  ctx.fillStyle = rim
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill()

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
  const item     = NAV_ITEMS[index]
  const ref      = useRef<THREE.Group>(null)
  const angle    = useRef((Math.random() - 0.5) * 0.3)
  const angVel   = useRef((Math.random() - 0.5) * 0.15)
  const prevMX   = useRef<number | null>(null)
  const { gunState, curtainOpen } = useGun()

  const isGun   = item.label === 'GUN'
  const isFired = isGun && (gunState === 'revealed' || gunState === 'shattering')

  // X position along the rail
  const x = -HALF_SPAN + SPACING * index

  const COM = ARM + KH / 2
  const w2  = 9.81 / COM

  const textTexture = useMemo(
    () => makeText(item.label, item.textColor),
    [item.label, item.textColor]
  )
  const holeTexture = useMemo(() => isGun ? makeBulletHoleTexture() : null, [isGun])
  const texture     = isFired && holeTexture ? holeTexture : textTexture

  useFrame((_, dt) => {
    const safe = Math.min(dt, 0.033)
    angVel.current += -w2 * angle.current * safe
    angVel.current *= Math.pow(0.978, safe * 60)   // less damping = longer swings
    angle.current  += angVel.current * safe
    angle.current   = Math.max(-1.2, Math.min(1.2, angle.current))
    if (ref.current) ref.current.rotation.z = angle.current
  })

  const onEnter = useCallback(() => {
    // Kick with a random impulse on hover enter — always feels alive
    const kick = (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.8)
    angVel.current += kick
    prevMX.current = null
  }, [])

  const onMove = useCallback((e: any) => {
    // Support both mouse and touch
    const mx = e.nativeEvent?.clientX ?? e.nativeEvent?.touches?.[0]?.clientX ?? null
    if (mx !== null && prevMX.current !== null) {
      const vx = (mx - prevMX.current) / window.innerWidth * 2
      if (Math.abs(vx) > 0.0005) angVel.current += vx * 55
    }
    prevMX.current = mx
  }, [])

  const onLeave = useCallback(() => { prevMX.current = null }, [])

  const onClick = useCallback((e: any) => {
    if (!curtainOpen) return   // disabled before curtain opens
    if (isFired) return
    e.stopPropagation()
    onNav(index, e.nativeEvent?.clientX ?? window.innerWidth / 2, e.nativeEvent?.clientY ?? 24)
  }, [index, onNav, isFired, curtainOpen])

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
        position       ={[0, -(ARM + KH / 2 + 0.11), 0]}
        onPointerEnter ={onEnter}
        onPointerMove  ={onMove}
        onPointerLeave ={onLeave}
        onClick        ={onClick}
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
  const groupRef     = useRef<THREE.Group>(null)

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

      <Rail />
      <group ref={groupRef}>
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
