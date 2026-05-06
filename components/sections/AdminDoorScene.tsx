'use client'

/* AdminDoorScene — R3F 3D 씬
   room_door_animation.glb + campbells_can.glb
   - 캔은 항상 렌더링; group scale=0.12로 시작, doorOpen 시 0.28로 lerp
   - 문 클릭 → 열림 애니메이션 (LoopOnce + clamp)
   - 문/캔 재클릭 → 역재생으로 닫힘 */

import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/room-door.glb')
useGLTF.preload('/campbells-can.glb')

// ── Door model ──────────────────────────────────────────────────────────────

function DoorModel({
  doorClicked,
  doorOpen,
  onDoorClick,
  onDoorOpen,
  onClose,
}: {
  doorClicked: boolean
  doorOpen:    boolean
  onDoorClick: () => void
  onDoorOpen:  () => void
  onClose:     () => void
}) {
  const group   = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/room-door.glb')
  const { actions, names }    = useAnimations(animations, group)
  const fired   = useRef(false)
  const closing = useRef(false)

  // Apply cream color to all door meshes after mount
  useEffect(() => {
    if (!group.current) return
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial
        if (!mat?.color) return
        mat.color.set('#FAF8F5')
        mat.roughness = 0.85
        mat.metalness = 0.0
        mat.needsUpdate = true
      })
    })
  }, [])

  // Open: play animation forward
  useEffect(() => {
    if (!doorClicked || fired.current) return
    fired.current = true
    const action = actions[names[0]]
    if (!action) { onDoorOpen(); return }
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.timeScale = 1
    action.reset().play()
    const duration = (action.getClip().duration ?? 2) * 1000
    setTimeout(onDoorOpen, duration)
  }, [doorClicked, actions, names, onDoorOpen])

  const triggerClose = () => {
    if (closing.current) return
    closing.current = true
    const action = actions[names[0]]
    if (!action) { onClose(); return }
    action.paused = false
    action.timeScale = -1
    action.play()
    const duration = (action.getClip().duration ?? 2) * 1000
    setTimeout(() => {
      closing.current = false
      fired.current   = false
      onClose()
    }, duration)
  }

  const handleClick = () => {
    if (!doorClicked) { onDoorClick();  return }
    if (doorOpen)     { triggerClose(); return }
  }

  return (
    <group ref={group}>
      <primitive
        object={scene.clone(true)}
        scale={1}
        position={[0, -1, 0]}
        onClick={handleClick}
        style={{ cursor: doorOpen || !doorClicked ? 'pointer' : 'default' }}
      />
    </group>
  )
}

// ── Campbell's can ──────────────────────────────────────────────────────────

function SoupCan({
  visible,
  onClose,
}: {
  visible:  boolean
  onClose:  () => void
}) {
  const { scene } = useGLTF('/campbells-can.glb')
  const ref = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!ref.current) return
    // scale: small(behind door) → medium(approaching)
    const targetScale = visible ? 0.28 : 0.12
    // z: inside door → coming toward camera
    const targetZ = visible ? 0.5 : -0.3
    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.05)
    )
    ref.current.position.z = THREE.MathUtils.lerp(
      ref.current.position.z, targetZ, 0.05
    )
    if (visible) {
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.04 - 0.88
    }
  })

  return (
    // position: inside the door frame opening; scale starts at 0.12 (tiny, behind door)
    <group ref={ref} position={[0.65, -0.88, -0.3]} scale={[0.12, 0.12, 0.12]}>
      <primitive
        object={scene.clone(true)}
        scale={0.8}
        onClick={visible ? onClose : undefined}
        style={visible ? { cursor: 'pointer' } : {}}
      />
    </group>
  )
}

// ── Scene wrapper ────────────────────────────────────────────────────────────

interface Props {
  doorClicked: boolean
  doorOpen:    boolean
  canVisible:  boolean
  onDoorClick: () => void
  onDoorOpen:  () => void
  onClose:     () => void
}

export default function AdminDoorScene({
  doorClicked, doorOpen, canVisible, onDoorClick, onDoorOpen, onClose,
}: Props) {
  return (
    <div style={{ width: '100%', height: '100%', cursor: doorClicked ? 'default' : 'pointer' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.0} />
        <pointLight position={[-2, 2, 2]} intensity={0.5} color="#ffddaa" />

        <Suspense fallback={null}>
          <DoorModel
            doorClicked={doorClicked}
            doorOpen={doorOpen}
            onDoorClick={onDoorClick}
            onDoorOpen={onDoorOpen}
            onClose={onClose}
          />
          <SoupCan visible={canVisible} onClose={onClose} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
