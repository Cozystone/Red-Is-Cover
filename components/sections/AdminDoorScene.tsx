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

  useFrame(({ clock }, delta) => {
    if (!ref.current) return

    // delta 기반 lerp — 프레임레이트 무관하게 일정한 속도
    const targetZ = visible ? TARGET_Z_FRONT : TARGET_Z_BACK
    const alpha = 1 - Math.pow(0.3, delta)
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, alpha)

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
// 텍스처 배치 로드로 초기 지직거림 방지

function WallDecorations() {
  const [fc, ll, ea, va, ow] = useTexture([
    '/posters/fight-club.jpg',   // 1000×1500 → 2:3
    '/posters/love-letter.jpg',  // 960×1440  → 2:3
    '/posters/eeaao.jpg',        // 1000×1448 → 0.691
    '/posters/virgil-abloh.jpg', // 183×275   → 2:3
    '/posters/offwhite.png',     // 500×500   → 1:1
  ])

  const PIN = 0.010 // 핀 반지름

  type P = { tex: THREE.Texture; pos: [number,number,number]; rotZ: number; w: number; h: number; pin?: boolean }

  const items: P[] = [
    // 문 왼쪽
    { tex: fc, pos: [-1.30,  0.32, 0.18], rotZ:  0.05,  w: 0.44, h: 0.66  },
    { tex: ea, pos: [-1.60, -0.48, 0.18], rotZ: -0.05,  w: 0.44, h: 0.637 },
    // Off-White 1:1 정사각형, 핀 없음
    { tex: ow, pos: [-0.96,  0.88, 0.18], rotZ:  0.02,  w: 0.44, h: 0.44, pin: false },
    // 문 오른쪽
    { tex: ll, pos: [ 1.12,  0.36, 0.18], rotZ: -0.04,  w: 0.44, h: 0.66  },
    { tex: va, pos: [ 1.48, -0.42, 0.18], rotZ:  0.05,  w: 0.42, h: 0.63  },
  ]

  return (
    <group>
      {items.map(({ tex, pos, rotZ, w, h, pin = true }, i) => (
        <group key={i} position={pos} rotation={[0, 0, rotZ]}>
          <mesh>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial map={tex} />
          </mesh>
          {pin && (
            <mesh position={[0, h / 2 - 0.03, 0.012]}>
              <sphereGeometry args={[PIN, 8, 8]} />
              <meshStandardMaterial color="#CC2222" metalness={0.5} roughness={0.3} />
            </mesh>
          )}
        </group>
      ))}
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
