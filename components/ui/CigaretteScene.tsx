'use client'

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Center } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/cigarette.glb')

// ── Smoke shader ──────────────────────────────────────────────────────────────

const SMOKE_VERT = `
  attribute float aOpacity;
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aAngle;
  attribute float aBrightness;
  varying float vOpacity;
  varying vec3  vColor;
  varying float vAngle;
  varying float vBrightness;

  void main() {
    vOpacity    = aOpacity;
    vColor      = aColor;
    vAngle      = aAngle;
    vBrightness = aBrightness;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * 440.0 / -mvPos.z;
    gl_Position  = projectionMatrix * mvPos;
  }
`

const SMOKE_FRAG = `
  varying float vOpacity;
  varying vec3  vColor;
  varying float vAngle;
  varying float vBrightness;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);

    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 ruv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    // Organic edge: slight sine-wave distortion breaks perfect ellipse
    float wobble = sin(ruv.x * 18.0 + vAngle * 5.0) * 0.04;
    float d = ruv.x * ruv.x * 3.5 + (ruv.y + wobble) * (ruv.y + wobble) * 14.0;
    if (d > 1.0) discard;

    // Soft falloff with brightness variation per particle
    float a = (1.0 - d) * (1.0 - sqrt(d) * 0.35) * vOpacity;
    if (a < 0.004) discard;

    gl_FragColor = vec4(vColor * vBrightness, a);
  }
`

// ── Smoke particle system ─────────────────────────────────────────────────────

const MAX_SMOKE = 550
const LIFETIME  = 26.0
const PREWARM   = 140

interface SmokeProps {
  emitX:    number
  emitXLen: number
  emitY:    number
  emitZ:    number
}

const TRANS = 0.32

function growFactor(_t: number) {
  return 0.40
}

function smokeColor(t: number): [number, number, number] {
  return [
    Math.max(0.52, 0.90 - t * 0.38),
    Math.max(0.52, 0.87 - t * 0.35),
    Math.max(0.52, 0.82 - t * 0.30),
  ]
}

function SmokeParticles({ emitX, emitXLen, emitY, emitZ }: SmokeProps) {
  const emitTimer = useRef(0)

  const { geo, pos, opa, sz, col, ang, brt, ages, vx, vy, vz, va } = useMemo(() => {
    const ages = new Float32Array(MAX_SMOKE).fill(-1)
    const vx   = new Float32Array(MAX_SMOKE)
    const vy   = new Float32Array(MAX_SMOKE)
    const vz   = new Float32Array(MAX_SMOKE)
    const va   = new Float32Array(MAX_SMOKE)
    const pos  = new Float32Array(MAX_SMOKE * 3)
    const opa  = new Float32Array(MAX_SMOKE)
    const sz   = new Float32Array(MAX_SMOKE)
    const col  = new Float32Array(MAX_SMOKE * 3)
    const ang  = new Float32Array(MAX_SMOKE)
    const brt  = new Float32Array(MAX_SMOKE)

    for (let i = 0; i < MAX_SMOKE; i++) {
      pos[i*3] = emitX; pos[i*3+1] = emitY; pos[i*3+2] = emitZ
      ang[i] = Math.random() * Math.PI * 2
      brt[i] = 0.70 + Math.random() * 0.55
      const [r,g,b] = smokeColor(0)
      col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b
    }

    for (let i = 0; i < PREWARM; i++) {
      const frac = (i + 0.5) / PREWARM
      const age  = frac * LIFETIME * 0.88
      ages[i] = age

      const vy0  = 0.22 + Math.random() * 0.10
      const decK = 0.028
      const rise = (vy0 / decK) * (1 - Math.exp(-decK * age))

      const tFrac      = age / LIFETIME
      const turbSpread = tFrac < TRANS ? 0 : 0.55 * (tFrac - TRANS) / (1 - TRANS)

      const frontBack = Math.random() < 0.5 ? -1 : 1
      const zOff      = frontBack * (0.20 + Math.random() * 0.20)

      pos[i*3]   = emitX - Math.random() * emitXLen + (Math.random() - 0.5) * turbSpread
      pos[i*3+1] = emitY + rise
      pos[i*3+2] = emitZ + zOff + (Math.random() - 0.5) * turbSpread * 0.3

      vy[i] = vy0 * Math.exp(-decK * age)
      const hSpread = tFrac < TRANS ? 0 : 0.010 * (tFrac - TRANS) / (1 - TRANS)
      vx[i] = (Math.random() - 0.5) * hSpread
      vz[i] = (Math.random() - 0.5) * hSpread * 0.5
      va[i] = (Math.random() - 0.5) * 0.4

      ang[i] = Math.random() * Math.PI * 2
      brt[i] = 0.70 + Math.random() * 0.55
      sz[i]  = growFactor(tFrac)
      opa[i] = Math.max(0, Math.pow(1 - tFrac, 0.6) * 0.72)
      const [r,g,b] = smokeColor(tFrac)
      col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',    new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aOpacity',    new THREE.BufferAttribute(opa, 1))
    geo.setAttribute('aSize',       new THREE.BufferAttribute(sz,  1))
    geo.setAttribute('aColor',      new THREE.BufferAttribute(col, 3))
    geo.setAttribute('aAngle',      new THREE.BufferAttribute(ang, 1))
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brt, 1))
    return { geo, pos, opa, sz, col, ang, brt, ages, vx, vy, vz, va }
  }, [emitX, emitXLen, emitY, emitZ])

  useEffect(() => () => geo.dispose(), [geo])

  const skipRef = useRef(false)
  useFrame((_, dt) => {
    // Throttle to ~30fps to halve main-thread cost (smoke is slow anyway)
    skipRef.current = !skipRef.current
    if (skipRef.current) return

    const safe = Math.min(dt * 2, 0.05)  // compensate doubled dt for deferred frames
    emitTimer.current += safe

    if (emitTimer.current > 0.018) {
      emitTimer.current = 0
      for (let i = 0; i < MAX_SMOKE; i++) {
        if (ages[i] >= 0) continue
        ages[i] = 0
        const spread    = 0.005
        const frontBack = Math.random() < 0.5 ? -1 : 1
        pos[i*3]   = emitX - Math.random() * emitXLen
        pos[i*3+1] = emitY + (Math.random() - 0.5) * spread
        pos[i*3+2] = emitZ + frontBack * (0.15 + Math.random() * 0.18)
        vy[i]  = 0.22 + Math.random() * 0.10
        vx[i]  = (Math.random() - 0.5) * 0.001
        vz[i]  = (Math.random() - 0.5) * 0.001
        va[i]  = (Math.random() - 0.5) * 0.4
        ang[i] = Math.random() * Math.PI * 2
        brt[i] = 0.70 + Math.random() * 0.55
        sz[i]  = growFactor(0)
        opa[i] = 0.68 + Math.random() * 0.16
        const [r,g,b] = smokeColor(0)
        col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b
        break
      }
    }

    for (let i = 0; i < MAX_SMOKE; i++) {
      if (ages[i] < 0) continue
      ages[i] += safe
      if (ages[i] > LIFETIME) {
        ages[i] = -1
        pos[i*3] = emitX; pos[i*3+1] = emitY; pos[i*3+2] = emitZ
        opa[i] = 0
        continue
      }

      const t = ages[i] / LIFETIME

      vy[i] *= (1 - 0.028 * safe)

      const turbScale = t < TRANS ? 0 : (t - TRANS) / (1 - TRANS) * 5.0
      vx[i] += (Math.random() - 0.5) * 0.06 * turbScale * safe
      vz[i] += (Math.random() - 0.5) * 0.06 * turbScale * safe
      vx[i] *= (1 - 0.035 * safe)
      vz[i] *= (1 - 0.035 * safe)

      pos[i*3]   += vx[i] * safe
      pos[i*3+1] += vy[i] * safe
      pos[i*3+2] += vz[i] * safe

      ang[i] += va[i] * safe

      sz[i]  = growFactor(t)
      opa[i] = Math.max(0, Math.pow(1 - t, 0.6) * 0.72)
      const [r,g,b] = smokeColor(t)
      col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b
    }

    ;(geo.attributes.position    as THREE.BufferAttribute).needsUpdate = true
    ;(geo.attributes.aOpacity    as THREE.BufferAttribute).needsUpdate = true
    ;(geo.attributes.aSize       as THREE.BufferAttribute).needsUpdate = true
    ;(geo.attributes.aColor      as THREE.BufferAttribute).needsUpdate = true
    ;(geo.attributes.aAngle      as THREE.BufferAttribute).needsUpdate = true
    ;(geo.attributes.aBrightness as THREE.BufferAttribute).needsUpdate = false
  })

  return (
    <points args={[geo]} renderOrder={10}>
      <shaderMaterial
        vertexShader={SMOKE_VERT}
        fragmentShader={SMOKE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

// ── Cigarette mesh ────────────────────────────────────────────────────────────

function CigaretteMesh() {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/cigarette.glb')
  const { actions, mixer } = useAnimations(animations, group)

  const { scale, emitX, emitXLen, emitY, emitZ } = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const ctr  = box.getCenter(new THREE.Vector3())
    const maxD = Math.max(size.x, size.y, size.z) || 1
    const s    = 2.6 / maxD
    return {
      scale:    s,
      emitX:    box.max.x,
      emitXLen: maxD * 0.10,
      emitY:    ctr.y + maxD * 0.04,
      emitZ:    ctr.z,
    }
  }, [scene])

  useEffect(() => {
    Object.values(actions).forEach(action => action?.reset().play())
    return () => { mixer.stopAllAction() }
  }, [actions, mixer])

  return (
    <group ref={group} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} />
      <SmokeParticles emitX={emitX} emitXLen={emitXLen} emitY={emitY} emitZ={emitZ} />
    </group>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

interface CigaretteSceneProps {
  visible: boolean
}

export default function CigaretteScene({ visible }: CigaretteSceneProps) {
  if (!visible) return null
  return (
    <div
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        22,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{
          alpha:               true,
          antialias:           true,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 4]}   intensity={2.2} color="#fff8f0" />
        <directionalLight position={[-3, -1, 2]}  intensity={0.4} color="#aabbcc" />
        <pointLight       position={[0, -1.5, 3]} intensity={1.0} color="#ff5522" />

        <Suspense fallback={null}>
          <Center>
            <CigaretteMesh />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  )
}
