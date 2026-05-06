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
  const fired        = useRef(false)
  const closing      = useRef(false)
  const halfDuration = useRef(1500) // ms — half of open+close clip

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

  // Open: play first half of clip (open phase), then pause
  // GLB clip is "open → close" in one cycle — pause at T/2 = fully open
  useEffect(() => {
    if (!doorClicked || fired.current) return
    fired.current = true
    const action = actions[names[0]]
    if (!action) { onDoorOpen(); return }

    const clipMs = (action.getClip().duration ?? 3) * 1000
    halfDuration.current = clipMs / 2

    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.timeScale = 1
    action.reset().play()

    // Pause at midpoint = door fully open
    setTimeout(() => {
      action.paused = true
      onDoorOpen()
    }, halfDuration.current)
  }, [doorClicked, actions, names, onDoorOpen])

  // Close: resume from midpoint, play second half (close phase)
  useEffect(() => {
    if (closeSignal === 0 || closing.current) return
    closing.current = true
    const action = actions[names[0]]
    if (!action) { onClose(); return }

    action.paused = false
    action.play() // resumes from where it was paused (midpoint)

    setTimeout(() => {
      action.paused   = true
      closing.current = false
      fired.current   = false
      onClose()
    }, halfDuration.current)
  }, [closeSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </group>
  )
}

// ── Campbell's can ──────────────────────────────────────────────────────────
// visible=false: 문 뒤 바닥에 작게 (z=-1.5, 카메라에서 보이지 않음)
// visible=true:  Z축으로만 앞으로 걸어나옴 (z → 0.1), 스케일 커짐

function SoupCan({ visible }: { visible: boolean }) {
  const { scene } = useGLTF('/campbells-can.glb')
  const ref = useRef<THREE.Group>(null!)
  const clonedCan = useMemo(() => scene.clone(true), [scene])

  useFrame(({ clock }) => {
    if (!ref.current) return

    const targetScale = visible ? 0.18 : 0.05
    const targetZ     = visible ? 0.1  : -1.5

    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.035)
    )
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.035)

    // gentle idle bob when fully out
    if (visible && Math.abs(ref.current.position.z - 0.1) < 0.1) {
      ref.current.position.y = -0.85 + Math.sin(clock.getElapsedTime() * 0.9) * 0.025
    }
  })

  // 문 프레임 중앙(x=0.1), 바닥 높이, 문 뒤에서 시작
  return (
    <group ref={ref} position={[0.1, -0.85, -1.5]} scale={[0.05, 0.05, 0.05]}>
      <primitive object={clonedCan} scale={0.8} />
    </group>
  )
}

// ── Scene wrapper ────────────────────────────────────────────────────────────

interface Props {
  doorClicked:  boolean
  doorOpen:     boolean
  canVisible:   boolean
  canKey:       number
  closeSignal:  number
  onDoorOpen:   () => void
  onClose:      () => void
}

export default function AdminDoorScene({
  doorClicked, canVisible, canKey, closeSignal, onDoorOpen, onClose,
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
          <SoupCan key={canKey} visible={canVisible} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
