'use client'

// GrassField — InstancedMesh grass + Freeman Alley backdrop
// Shadows via shadow map. Spring-physics sway + mouse-velocity parting.

import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/alley_opt.glb')
useGLTF.preload('/grass_opt.glb')

const TOTAL_BLADES  = 1400
const MOUSE_WORLD_X = 7

function xHalfAt(z: number): number {
  if (z >= 0) return 7.0
  const t = Math.min(1, -z / 14)
  return 4.0 - t * 2.4
}

// ── Camera setup ───────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => { camera.lookAt(0, 0.2, -10) }, [camera])
  return null
}

// ── Auto-fit helper ────────────────────────────────────────────────────────────

function fitScene(obj: THREE.Object3D, targetSize: number) {
  const box    = new THREE.Box3().setFromObject(obj)
  const size   = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  obj.scale.setScalar(targetSize / (maxDim || 1))
  const box2 = new THREE.Box3().setFromObject(obj)
  const ctr  = box2.getCenter(new THREE.Vector3())
  obj.position.x -= ctr.x
  obj.position.z -= ctr.z
  obj.position.y -= box2.min.y
}

// ── Alley background ───────────────────────────────────────────────────────────

function Alley() {
  const { scene } = useGLTF('/alley_opt.glb')
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    fitScene(c, 20)
    c.position.z -= 5
    c.position.y -= 0.05
    // Enable shadow receiving on all alley meshes
    c.traverse(child => {
      if (child instanceof THREE.Mesh) {
        // no shadows — avoids shader validation errors with multiple WebGL contexts
      }
    })
    return c
  }, [scene])
  return <primitive object={cloned} />
}

// ── InstancedMesh grass ────────────────────────────────────────────────────────

interface MouseRef    { current: { x: number; y: number } }
interface MouseVelRef { current: number }   // x-axis velocity only

interface BladeData {
  x: number; y: number; z: number
  rotY: number; scale: number; phase: number
  curRotZ: number
  velRotZ: number   // spring velocity
}

// Spring constants — tweak for feel
const SPRING_K = 18   // stiffness
const SPRING_D = 7    // damping (>= 2*sqrt(K) for critically-damped)

function GrassInstances({ mouseRef, mouseVelRef }: { mouseRef: MouseRef; mouseVelRef: MouseVelRef }) {
  const { scene: src } = useGLTF('/grass_opt.glb')
  const floorRef = useRef<THREE.InstancedMesh>(null)
  const alleyRef = useRef<THREE.InstancedMesh>(null)
  const dummy    = useMemo(() => new THREE.Object3D(), [])

  const { geometry, matFloor, matAlley, bladeH, geoMinY } = useMemo(() => {
    const meshes: THREE.Mesh[] = []
    src.traverse(c => { if (c instanceof THREE.Mesh) meshes.push(c) })
    const found = meshes[0]

    const geo = found
      ? (() => {
          const g = found.geometry.clone()
          const keep = new Set(['position', 'normal', 'uv', 'color'])
          for (const key of Object.keys(g.attributes)) {
            if (!keep.has(key)) g.deleteAttribute(key)
          }
          g.morphAttributes = {}
          return g
        })()
      : new THREE.PlaneGeometry(0.06, 0.35) as THREE.BufferGeometry

    const srcMat = found
      ? (Array.isArray(found.material) ? found.material[0] : found.material) as THREE.MeshStandardMaterial
      : new THREE.MeshStandardMaterial({ color: '#3d6b2e' })

    const mFloor = srcMat.clone()
    mFloor.side       = THREE.DoubleSide
    mFloor.depthTest  = false
    mFloor.depthWrite = false

    const mAlley = srcMat.clone()
    mAlley.side       = THREE.DoubleSide
    mAlley.depthWrite = false

    const box    = new THREE.Box3().setFromObject(src)
    const bladeH = box.getSize(new THREE.Vector3()).y || 1
    geo.computeBoundingBox()
    const bb      = geo.boundingBox!
    const geoMinY = bb.min.y
    const geoMaxY = bb.max.y

    // Vertex colors: dark at base (AO shadow), bright at tip
    const pos   = geo.attributes.position as THREE.BufferAttribute
    const vcols = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const t = Math.max(0, Math.min(1, (pos.getY(i) - geoMinY) / ((geoMaxY - geoMinY) || 1)))
      const v = 0.22 + t * 0.78   // stronger shadow at base
      vcols[i * 3] = v; vcols[i * 3 + 1] = v; vcols[i * 3 + 2] = v
    }
    geo.setAttribute('color', new THREE.BufferAttribute(vcols, 3))
    mFloor.vertexColors = true
    mAlley.vertexColors = true

    return { geometry: geo, matFloor: mFloor as THREE.Material, matAlley: mAlley as THREE.Material, bladeH, geoMinY }
  }, [src])

  const { floorBlades, alleyBlades } = useMemo<{ floorBlades: BladeData[]; alleyBlades: BladeData[] }>(() => {
    const floor: BladeData[] = []
    const alley: BladeData[] = []

    const makeBlade = (x: number, z: number): BladeData => {
      const depthScale = z < 0 ? 0.6 + 0.4 * (1 + z / 14) : 1.0
      const scale = (0.16 + Math.random() * 0.18) * depthScale / bladeH
      return { x, y: -geoMinY * scale + 0.12, z, rotY: Math.random() * Math.PI * 2, scale, phase: Math.random() * Math.PI * 2, curRotZ: 0, velRotZ: 0 }
    }

    for (let i = 0; i < TOTAL_BLADES; i++) {
      const onSidewalk = Math.random() < 0.60
      const z = onSidewalk ? Math.random() * 4.0 : -14.0 + Math.random() * 14.5
      const xH = xHalfAt(z)
      const r  = Math.random()
      let x: number
      if (onSidewalk) {
        x = (Math.random() - 0.5) * xH * 2
      } else {
        if (r < 0.20)      x = -(xH * 0.6 + Math.random() * xH * 0.4)
        else if (r < 0.40) x =  (xH * 0.6 + Math.random() * xH * 0.4)
        else               x = (Math.random() - 0.5) * xH * 2
      }
      const b = makeBlade(x, z)
      if (z >= 0) floor.push(b); else alley.push(b)
    }

    // 1-point perspective streaks toward vanishing point
    const VP_Z = 11
    for (let i = 0; i < 500; i++) {
      const z  = -(Math.random() * VP_Z)
      const t  = 1 - (-z / VP_Z)
      const x0 = (Math.random() - 0.5) * 14
      alley.push(makeBlade(x0 * t, z))
    }
    // Extra building-side density
    for (let i = 0; i < 350; i++) {
      const z   = -(Math.random() * VP_Z)
      const t   = 1 - (-z / VP_Z)
      const abs = 2.5 + Math.random() * 4.5
      const x0  = (Math.random() < 0.5 ? -1 : 1) * abs
      alley.push(makeBlade(x0 * t, z))
    }

    return { floorBlades: floor, alleyBlades: alley }
  }, [bladeH, geoMinY])

  const initMesh = (mesh: THREE.InstancedMesh | null, blades: BladeData[]) => {
    if (!mesh) return
    blades.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z)
      dummy.rotation.set(0, b.rotY, 0)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  useEffect(() => { initMesh(floorRef.current, floorBlades) }, [floorBlades])
  useEffect(() => { initMesh(alleyRef.current, alleyBlades) }, [alleyBlades])

  useFrame(({ clock }, dt) => {
    const safe        = Math.min(dt, 0.033)
    const t           = clock.elapsedTime
    const mouseWorldX = mouseRef.current.x * MOUSE_WORLD_X
    const mVel        = mouseVelRef.current   // horizontal cursor velocity
    const RADIUS      = 2.5

    const updateMesh = (mesh: THREE.InstancedMesh | null, blades: BladeData[]) => {
      if (!mesh) return
      blades.forEach((b, i) => {
        const dx   = b.x - mouseWorldX
        const dist = Math.abs(dx)

        // Ambient wind — gentle, phase-offset per blade
        const wind = Math.sin(b.x * 0.4 + t * 1.2 + b.phase) * 0.035 * (b.z < 0 ? 1.2 : 1.0)

        // Mouse push: parting effect uses cursor velocity direction
        let push = 0
        if (dist < RADIUS) {
          const str = (1 - dist / RADIUS) ** 1.6
          // Push away + lean with cursor travel direction
          push = -Math.sign(dx) * str * 0.30 + mVel * str * 0.06
        }

        // Spring physics: natural overshoot + settle
        const target = wind + push
        const acc    = (target - b.curRotZ) * SPRING_K - b.velRotZ * SPRING_D
        b.velRotZ   += acc * safe
        b.curRotZ   += b.velRotZ * safe
        b.curRotZ    = Math.max(-0.55, Math.min(0.55, b.curRotZ))

        dummy.position.set(b.x, b.y, b.z)
        dummy.rotation.set(0, b.rotY, b.curRotZ)
        dummy.scale.setScalar(b.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }

    updateMesh(floorRef.current, floorBlades)
    updateMesh(alleyRef.current, alleyBlades)
  })

  return (
    <>
      <instancedMesh ref={floorRef} args={[geometry, matFloor, floorBlades.length]}
        frustumCulled={false} renderOrder={6} />
      <instancedMesh ref={alleyRef} args={[geometry, matAlley, alleyBlades.length]}
        frustumCulled={false} renderOrder={5} />
    </>
  )
}

// ── Full scene ─────────────────────────────────────────────────────────────────

function Scene() {
  const mouseRef    = useRef({ x: 0, y: 0 })
  const mouseVelRef = useRef(0)    // horizontal velocity (NDC units/frame, decays)
  const prevMouseX  = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      mouseVelRef.current = (nx - prevMouseX.current) * 35
      prevMouseX.current  = nx
      mouseRef.current = {
        x:  nx,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Decay mouse velocity each frame
  useFrame(() => { mouseVelRef.current *= 0.82 })

  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.75} />
      {/* Key light with shadows */}
      <directionalLight
        position={[4, 14, 6]}
        intensity={1.8}
      />
      <directionalLight position={[-4, 4, -2]} intensity={0.5} color="#b8ccdd" />
      <Suspense fallback={null}>
        <Alley />
        <GrassInstances mouseRef={mouseRef} mouseVelRef={mouseVelRef} />
      </Suspense>
    </>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────────

export default function GrassField() {
  return (
    <div
      style={{
        position:      'absolute',
        bottom:        0,
        left:          0,
        width:         '100%',
        height:        'clamp(220px, 38vh, 400px)',
        zIndex:        3,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{
          alpha:               true,
          antialias:           true,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        camera={{ position: [0, 1.1, 3.2], fov: 64 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
