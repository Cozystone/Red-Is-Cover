'use client'

/* AdminDoorScene — R3F 3D 씬 (클릭 처리 없음 — AdminDoor DOM div가 전담)
   DoorModel: closeSignal prop 변화 시 역재생
   SoupCan: 문 뒤/위에서 작게 → 문 열리면 앞으로 내려오며 커짐 */

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, useTexture } from '@react-three/drei'
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

  const TARGET_Z_BACK  = -1.5  // 문 뒤 (닫힌 상태)
  const TARGET_Z_FRONT = 0.6   // 문 앞으로 나온 위치

  useFrame(({ clock }) => {
    if (!ref.current) return

    // 스케일 고정 — Z 이동만으로 원근감 효과
    const targetZ = visible ? TARGET_Z_FRONT : TARGET_Z_BACK
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.04)

    // 완전히 나온 후 살짝 bob
    if (visible && Math.abs(ref.current.position.z - TARGET_Z_FRONT) < 0.1) {
      ref.current.position.x = 0
      ref.current.position.y = -0.35 + Math.sin(clock.getElapsedTime() * 0.9) * 0.025
    }
  })

  // scale 고정 0.14 — 문보다 작게, 로고가 앞을 보도록 Y축 90도 회전
  return (
    <group ref={ref} position={[0, -0.35, TARGET_Z_BACK]} scale={[0.12, 0.12, 0.12]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={clonedCan} scale={0.8} />
    </group>
  )
}

// ── Wall decorations ─────────────────────────────────────────────────────────

// 핀 꽂힌 포스터
function PinnedPoster({
  url, position, rotation = [0, 0, 0], width, height,
}: {
  url: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
}) {
  const texture = useTexture(url)
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* 핀 — 아주 작은 구 */}
      <mesh position={[0, height / 2 - 0.03, 0.012]}>
        <sphereGeometry args={[0.010, 8, 8]} />
        <meshStandardMaterial color="#CC2222" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// 핀 없이 벽에 평평하게 붙인 포스터 (Off-White 등)
function FlatPoster({
  url, position, rotation = [0, 0, 0], width, height, transparent = false,
}: {
  url: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  transparent?: boolean
}) {
  const texture = useTexture(url)
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} transparent={transparent} alphaTest={0.05} />
    </mesh>
  )
}

function WallDecorations() {
  // Off-White 이미지 비율 ≈ 4.25 : 1 (가로형 배너)
  const owW = 0.88
  const owH = owW / 4.25

  return (
    <group>
      {/* ── 문 왼쪽 ── */}
      <PinnedPoster url="/posters/fight-club.jpg"
        position={[-1.45, 0.28, 0.18]} rotation={[0, 0, 0.18]}  width={0.52} height={0.78} />
      <PinnedPoster url="/posters/eeaao.jpg"
        position={[-2.15, -0.08, 0.18]} rotation={[0, 0, -0.06]} width={0.52} height={0.78} />

      {/* Off-White — 왼쪽 포스터들 위 빈공간, 핀 없음, 비율 유지 */}
      <FlatPoster url="/posters/offwhite.png"
        position={[-1.80, 0.72, 0.18]} rotation={[0, 0, -0.01]}
        width={owW} height={owH} transparent />

      {/* ── 문 오른쪽 ── */}
      <PinnedPoster url="/posters/love-letter.jpg"
        position={[1.25, 0.22, 0.18]} rotation={[0, 0, -0.04]} width={0.52} height={0.78} />
      <PinnedPoster url="/posters/virgil-abloh.jpg"
        position={[1.88, -0.08, 0.18]} rotation={[0, 0, 0.18]}  width={0.58} height={0.58} />
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
          <WallDecorations />
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
