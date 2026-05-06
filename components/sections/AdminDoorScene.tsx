'use client'

/* AdminDoorScene — R3F 3D 씬
   room_door_animation.glb + campbells_can.glb
   - 캔: 처음엔 위에서 작게 보임 → 문 열리면 아래로 내려오며 커짐
   - 문: 클릭 → LoopOnce 열림, 재클릭 → 역재생 닫힘 */

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/room-door.glb')
useGLTF.preload('/campbells-can.glb')

// ── Door model ──────────────────────────────────────────────────────────────

function DoorModel({
  doorClicked, doorOpen, onDoorClick, onDoorOpen, onClose,
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

  // Clone scene once
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  // Apply white material to all door meshes after mount
  useEffect(() => {
    if (!group.current) return
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial
        if (!mat?.color) return
        mat.color.set('#FFFFFF')
        mat.roughness = 0.9
        mat.metalness = 0.0
        mat.needsUpdate = true
      })
    })
  }, [])

  // Open: play animation forward once, pause at end
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
    setTimeout(() => {
      action.paused = true
      onDoorOpen()
    }, duration)
  }, [doorClicked, actions, names, onDoorOpen])

  const triggerClose = () => {
    if (closing.current) return
    closing.current = true
    const action = actions[names[0]]
    if (!action) { onClose(); return }
    // Resume from clamped end position, play in reverse
    action.paused    = false
    action.timeScale = -1
    action.time      = action.getClip().duration  // start from open position
    action.play()
    const duration = (action.getClip().duration ?? 2) * 1000
    setTimeout(() => {
      action.paused   = true
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
        object={clonedScene}
        scale={1}
        position={[0, -1, 0]}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
    </group>
  )
}

// ── Campbell's can ──────────────────────────────────────────────────────────

function SoupCan({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { scene } = useGLTF('/campbells-can.glb')
  const ref = useRef<THREE.Group>(null!)
  const clonedCan = useMemo(() => scene.clone(true), [scene])

  useFrame(({ clock }) => {
    if (!ref.current) return
    // Scale: tiny(above) → medium(floor level)
    const targetScale = visible ? 0.50 : 0.13
    // Y: starts above door frame, drops when visible
    const targetY = visible ? -0.88 : 2.2

    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.04)
    )
    const lerpedY = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.04)
    // Idle bob only when fully descended
    const bob = visible && Math.abs(lerpedY - targetY) < 0.08
      ? Math.sin(clock.getElapsedTime() * 0.9) * 0.04
      : 0
    ref.current.position.y = lerpedY + bob
  })

  // x: center of door frame opening; z: inside the opening
  return (
    <group ref={ref} position={[0.7, 2.2, -0.15]} scale={[0.13, 0.13, 0.13]}>
      <primitive
        object={clonedCan}
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
    <div style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.0} />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#ffeecc" />

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
