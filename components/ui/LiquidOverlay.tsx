'use client'

/* LiquidOverlay — fullscreen 3-D metallic liquid surface.
   Wave simulation runs on CPU; result is uploaded each frame as a DataTexture.
   A fullscreen quad + custom GLSL renders normals + specular highlights so the
   surface looks like dark liquid metal (similar to threejs-components liquid1).
   onComplete fires when wave amplitude crosses the corner-detection threshold. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Simulation constants ──────────────────────────────────────────────────────
const COLS  = 180
const ROWS  = 120
const DAMP  = 0.993
const C2    = 0.46
const MRAD  = 10
const AMP   = 3.5
const CTHR  = 0.18   // corner amplitude threshold
const CSIZ  = 12     // corner region size

// ── GLSL shaders ─────────────────────────────────────────────────────────────

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D uWave;
  uniform vec2      uRes;
  uniform float     uTime;
  varying vec2 vUv;

  void main() {
    vec2 px = 1.0 / uRes;

    float hC = texture2D(uWave, vUv             ).r;
    float hL = texture2D(uWave, vUv - vec2(px.x, 0.0)).r;
    float hR = texture2D(uWave, vUv + vec2(px.x, 0.0)).r;
    float hD = texture2D(uWave, vUv - vec2(0.0, px.y)).r;
    float hU = texture2D(uWave, vUv + vec2(0.0, px.y)).r;

    float h = hC * 2.0 - 1.0;

    // Surface normal from finite differences
    vec3 n = normalize(vec3((hL - hR) * 4.0, (hD - hU) * 4.0, 0.18));

    vec3 l1 = normalize(vec3(-0.6,  0.8, 0.6));
    vec3 l2 = normalize(vec3( 0.7,  0.6, 0.5));
    vec3 l3 = normalize(vec3( 0.0, -0.5, 0.7));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    float spec1 = pow(max(dot(n, normalize(l1 + viewDir)), 0.0), 64.0);
    float spec2 = pow(max(dot(n, normalize(l2 + viewDir)), 0.0), 48.0);
    float spec3 = pow(max(dot(n, normalize(l3 + viewDir)), 0.0), 32.0);
    float spec  = spec1 * 0.9 + spec2 * 0.6 + spec3 * 0.3;

    float waveAmp = abs(h);
    vec3  color   = vec3(0.78, 0.90, 1.00) * spec
                  + vec3(0.40, 0.65, 1.00) * waveAmp * 0.10
                  + vec3(0.03, 0.06, 0.14);  // dark blue ambient tint

    // Semi-transparent: underlying scene shows through, liquid builds with waves
    float alpha = 0.55 + waveAmp * 0.22 + spec * 0.23;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.90));
  }
`

// ── Wave simulation + Three.js mesh ──────────────────────────────────────────

type DisturbFn = (nx: number, ny: number, amp: number) => void

interface LiquidMeshProps {
  onComplete: () => void
  disturbRef: React.MutableRefObject<DisturbFn | null>
}

function LiquidMesh({ onComplete, disturbRef }: LiquidMeshProps) {
  const { size } = useThree()
  const meshRef  = useRef<THREE.Mesh>(null)
  const matRef   = useRef<THREE.ShaderMaterial>(null)

  // Wave buffers (CPU)
  const N    = COLS * ROWS
  const bufA = useRef(new Float32Array(N))
  const bufB = useRef(new Float32Array(N))
  const at   = (x: number, y: number) => y * COLS + x

  // DataTexture (R channel = height)
  const texData = useRef(new Uint8Array(COLS * ROWS * 4).fill(0))
  const texture = useRef<THREE.DataTexture>((() => {
    const t = new THREE.DataTexture(texData.current, COLS, ROWS, THREE.RGBAFormat)
    t.magFilter = THREE.LinearFilter
    t.minFilter = THREE.LinearFilter
    t.needsUpdate = true
    return t
  })())

  // Corner tracking
  const reached  = useRef([false, false, false, false])
  const complete = useRef(false)

  // Disturbance helper (normalised coords → grid)
  const disturb = (nx: number, ny: number, amp: number) => {
    const gx = Math.round(nx * (COLS - 1))
    const gy = Math.round((1 - ny) * (ROWS - 1))   // flip Y (WebGL)
    for (let dy = -MRAD; dy <= MRAD; dy++) {
      for (let dx = -MRAD; dx <= MRAD; dx++) {
        const px = gx + dx, py = gy + dy
        if (px < 1 || px >= COLS - 1 || py < 1 || py >= ROWS - 1) continue
        const d = Math.hypot(dx, dy)
        if (d > MRAD) continue
        bufA.current[at(px, py)] += amp * (1 - d / MRAD) ** 2
      }
    }
  }

  // Expose disturb to parent via ref — avoids the timing bug where
  // a canvasRef-based useEffect ran before Canvas onCreated fired.
  useEffect(() => {
    disturbRef.current = disturb
    return () => { disturbRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Per-frame: wave step → texture update → corner check
  useFrame(({ clock }) => {
    const a = bufA.current, b = bufB.current
    // Wave step
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        const i   = at(x, y)
        const lap = a[at(x-1,y)] + a[at(x+1,y)] + a[at(x,y-1)] + a[at(x,y+1)] - 4 * a[i]
        b[i] = (2 * a[i] - b[i] + C2 * lap) * DAMP
      }
    }
    bufA.current = b; bufB.current = a   // swap

    // Upload to texture
    const td = texData.current
    const cur = bufA.current
    for (let i = 0; i < N; i++) {
      const v = ((cur[i] + 1.5) / 3 * 255 + 0.5) | 0
      const pi = i << 2
      td[pi] = td[pi+1] = td[pi+2] = Math.max(0, Math.min(255, v))
      td[pi+3] = 255
    }
    texture.current.needsUpdate = true

    // Update uniforms
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
      matRef.current.uniforms.uRes.value.set(size.width, size.height)
    }

    // Corner detection
    if (!complete.current) {
      const r = reached.current
      const corners: [number, number][] = [
        [0,           0          ],
        [COLS - CSIZ, 0          ],
        [0,           ROWS - CSIZ],
        [COLS - CSIZ, ROWS - CSIZ],
      ]
      corners.forEach(([cx, cy], i) => {
        if (r[i]) return
        outer:
        for (let dy = 0; dy < CSIZ; dy++)
          for (let dx = 0; dx < CSIZ; dx++)
            if (Math.abs(cur[at(cx+dx, cy+dy)]) > CTHR) {
              r[i] = true; break outer
            }
      })
      if (r.every(Boolean)) {
        complete.current = true
        onComplete()
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          uWave: { value: texture.current },
          uRes:  { value: new THREE.Vector2(size.width, size.height) },
          uTime: { value: 0 },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Exported component ────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void
}

export default function LiquidOverlay({ onComplete }: Props) {
  const disturbRef = useRef<DisturbFn | null>(null)
  const lastPos    = useRef({ x: -1, y: -1 })
  const divRef     = useRef<HTMLDivElement>(null)

  // Preload heavy GLBs while user stirs
  useEffect(() => {
    fetch('/box_white.glb').catch(() => {})
    fetch('/vintage_telephone.glb').catch(() => {})
  }, [])

  // Touch listener needs passive:false for preventDefault
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        disturbRef.current?.(
          t.clientX / window.innerWidth,
          t.clientY / window.innerHeight,
          AMP * 0.65,
        )
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const speed = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (speed > 0.002)
        disturbRef.current?.(nx, ny, Math.min(speed * 22, AMP))
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9000,
        cursor:     'crosshair',
      }}
    >
      <Canvas
        orthographic
        camera={{ near: -1, far: 1, zoom: 1 }}
        gl={{ antialias: false, alpha: true }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <LiquidMesh onComplete={onComplete} disturbRef={disturbRef} />
      </Canvas>

      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'clamp(28px, 5vh, 60px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
          fontSize:      '9px',
          fontWeight:    500,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.5)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          animation:     'liqHint 2.8s ease-in-out infinite',
        }}
      >
        Stir the liquid
      </div>

      <style>{`
        @keyframes liqHint {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </div>,
    document.body,
  )
}
