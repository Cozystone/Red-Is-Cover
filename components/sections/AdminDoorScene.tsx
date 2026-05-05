'use client'

/* AdminDoorScene — R3F 3D 씬
   room_door_animation.glb + campbells_can.glb */

import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

useGLTF.preload('/room-door.glb')
useGLTF.preload('/campbells-can.glb')

// ── Door model ──────────────────────────────────────────────────────────────

function DoorModel({
  doorClicked,
  onDoorClick,
  onDoorOpen,
}: {
  doorClicked: boolean
  onDoorClick: () => void
  onDoorOpen:  () => void
}) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/room-door.glb')
  const { actions, names }    = useAnimations(animations, group)
  const fired = useRef(false)

  useEffect(() => {
    if (!doorClicked || fired.current) return
    fired.current = true
    const action = actions[names[0]]
    if (!action) { onDoorOpen(); return }
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.reset().play()

    // Fire onDoorOpen after animation duration
    const duration = (action.getClip().duration ?? 2) * 1000
    setTimeout(onDoorOpen, duration)
  }, [doorClicked, actions, names, onDoorOpen])

  const obj = scene.clone(true)

  return (
    <group ref={group}>
      <primitive
        object={obj}
        scale={1}
        position={[0, -1, 0]}
        onClick={!doorClicked ? onDoorClick : undefined}
        style={!doorClicked ? { cursor: 'pointer' } : {}}
      />
    </group>
  )
}

// ── Campbell's can ──────────────────────────────────────────────────────────

function SoupCan({ visible }: { visible: boolean }) {
  const { scene } = useGLTF('/campbells-can.glb')
  const ref = useRef<THREE.Group>(null!)

  // Gentle idle bob
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.04 - 0.5
  })

  if (!visible) return null

  return (
    <group ref={ref} position={[1.2, -0.5, 0.5]}>
      <primitive object={scene.clone(true)} scale={0.8} />
    </group>
  )
}

// ── Scene wrapper ────────────────────────────────────────────────────────────

interface Props {
  doorClicked: boolean
  canVisible:  boolean
  onDoorClick: () => void
  onDoorOpen:  () => void
}

export default function AdminDoorScene({ doorClicked, canVisible, onDoorClick, onDoorOpen }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', cursor: doorClicked ? 'default' : 'pointer' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <pointLight position={[-2, 2, 2]} intensity={0.6} color="#ffddaa" />

        <Suspense fallback={null}>
          <DoorModel doorClicked={doorClicked} onDoorClick={onDoorClick} onDoorOpen={onDoorOpen} />
          <SoupCan visible={canVisible} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
