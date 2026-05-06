'use client'

/* AdminDoorScene — R3F 3D 씬 (클릭 처리 없음 — AdminDoor DOM div가 전담)
   DoorModel: closeSignal prop 변화 시 역재생
   SoupCan: 문 뒤/위에서 작게 → 문 열리면 앞으로 내려오며 커짐 */

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/room-door.glb')
useGLTF.preload('/campbells-can.glb')

// ── Door model ──────────────────────────────────────────────────────────────

function DoorModel({
  doorClicked, closeSignal, onDoorOpen, onClose,
}: {
  doorClicked:  boolean
  closeSignal:  number
  onDoorOpen:   () => void
  onClose:      () => void
}) {
  const group   = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/room-door.glb')
  const { actions, names }    = useAnimations(animations, group)
  const fired   = useRef(false)
  const closing = useRef(false)

  // White material
  useEffect(() => {
    scene.traverse((child) => {
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
  }, [scene])

  // Open animation
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

  // Close animation triggered by closeSignal
  useEffect(() => {
    if (closeSignal === 0 || closing.current) return
    closing.current = true
    const action = actions[names[0]]
    if (!action) { onClose(); return }
    action.paused    = false
    action.timeScale = -1
    action.time      = action.getClip().duration
    action.play()
    const duration = (action.getClip().duration ?? 2) * 1000
    setTimeout(() => {
      action.paused   = true
      closing.current = false
      fired.current   = false
      onClose()
    }, duration)
  }, [closeSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </group>
  )
}

// ── Campbell's can ──────────────────────────────────────────────────────────
// visible=false: 문 뒤 위쪽에 작게 (scale~0.05, z=-1.0, y=1.2)
// visible=true:  앞으로 내려오며 커짐 (scale~0.18, z=0.2, y=-0.8)

function SoupCan({ visible }: { visible: boolean }) {
  const { scene } = useGLTF('/campbells-can.glb')
  const ref = useRef<THREE.Group>(null!)
  const clonedCan = useMemo(() => scene.clone(true), [scene])

  useFrame(({ clock }) => {
    if (!ref.current) return

    const targetScale = visible ? 0.18 : 0.05
    const targetY     = visible ? -0.80 : 1.2
    const targetZ     = visible ? 0.15  : -1.0

    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.04)
    )
    const lerpedY = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.04)
    const bob = visible && Math.abs(lerpedY - targetY) < 0.08
      ? Math.sin(clock.getElapsedTime() * 0.9) * 0.03
      : 0
    ref.current.position.y = lerpedY + bob
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.04)
  })

  // x=0.5: door frame center; starts above/behind door
  return (
    <group ref={ref} position={[0.5, 1.2, -1.0]} scale={[0.05, 0.05, 0.05]}>
      <primitive object={clonedCan} scale={0.8} />
    </group>
  )
}

// ── Scene wrapper ────────────────────────────────────────────────────────────

interface Props {
  doorClicked:  boolean
  doorOpen:     boolean
  canVisible:   boolean
  closeSignal:  number
  onDoorOpen:   () => void
  onClose:      () => void
}

export default function AdminDoorScene({
  doorClicked, canVisible, closeSignal, onDoorOpen, onClose,
}: Props) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
        events={undefined}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.0} />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#ffeecc" />

        <Suspense fallback={null}>
          <DoorModel
            doorClicked={doorClicked}
            closeSignal={closeSignal}
            onDoorOpen={onDoorOpen}
            onClose={onClose}
          />
          <SoupCan visible={canVisible} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
