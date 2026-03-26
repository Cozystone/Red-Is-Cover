'use client'

/* LiquidOverlay — fullscreen domain-warped liquid surface shader.
   Organic, flowing folds of colour (dark crimson → red → cream highlights)
   rendered entirely on GPU.  Mouse movement increases the warp intensity;
   onComplete fires once the user has stirred enough OR after AUTO_MS. */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// How much total cursor movement (normalised) triggers completion
const STIR_GOAL  = 6.0
const AUTO_MS    = 9000   // fallback: auto-complete after 9 s

// ── GLSL ─────────────────────────────────────────────────────────────────────

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uWarp;   // increases as user stirs (0 → 1)
  varying vec2  vUv;

  /* ── Gradient noise ─────────────────────────────────────────────────── */
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }

  float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
          dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
      mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
          dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
      u.y
    );
  }

  /* ── FBM (5 octaves) ─────────────────────────────────────────────────── */
  float fbm(vec2 p) {
    float v = 0.0, a = 0.52;
    mat2  m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * gnoise(p);
      p  = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    /* aspect-correct UV centred at 0 */
    vec2 uv  = vUv * 2.0 - 1.0;
    float t  = uTime * 0.20;
    float w  = uWarp;               // 0 = calm, 1 = max stir

    /* ── Domain warp (Inigo Quilez technique) ──────────────────────────── */
    vec2 q = vec2(
      fbm(uv * 1.2 + vec2(0.00, 0.00) + t * 0.7),
      fbm(uv * 1.2 + vec2(5.20, 1.30) + t * 0.5)
    );

    vec2 r = vec2(
      fbm(uv * 1.0 + 3.5*q + vec2(1.70, 9.20) + t * 0.30 + w * 1.2),
      fbm(uv * 1.0 + 3.5*q + vec2(8.30, 2.80) + t * 0.26 + w * 0.9)
    );

    float f = fbm(uv * 0.9 + 3.2*r + t * 0.12 + w * 0.6);
    f = f * 0.5 + 0.5;   /* remap -1..1 → 0..1 */

    /* ── Dark red / crimson colour ramp ─────────────────────────────────── */
    vec3 c0 = vec3(0.03, 0.01, 0.01);   /* near black                  */
    vec3 c1 = vec3(0.30, 0.02, 0.04);   /* deep crimson                */
    vec3 c2 = vec3(0.75, 0.04, 0.08);   /* vivid red                   */
    vec3 c3 = vec3(0.95, 0.28, 0.06);   /* orange-red                  */
    vec3 c4 = vec3(1.00, 0.90, 0.80);   /* cream highlight at peaks    */

    vec3 col = mix(c0, c1, smoothstep(0.0, 0.4, f));
    col = mix(col, c2, smoothstep(0.35, 0.60, f));
    col = mix(col, c3, smoothstep(0.55, 0.78, f));
    /* bright ridge highlights — sharpened with warp */
    float peak = pow(max(f - 0.72 - w * 0.04, 0.0), 2.5 - w * 0.8);
    col += c4 * peak * (5.0 + w * 4.0);

    /* extra chromatic depth from q length */
    col = mix(col, c0, clamp(length(q) * 0.35 - 0.15, 0.0, 0.45));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

// ── Scene component ───────────────────────────────────────────────────────────

type StirFn = (delta: number) => void

interface LiquidMeshProps {
  onComplete: () => void
  stirRef:    React.MutableRefObject<StirFn | null>
}

function LiquidMesh({ onComplete, stirRef }: LiquidMeshProps) {
  const matRef      = useRef<THREE.ShaderMaterial>(null)
  const stirTotal   = useRef(0)
  const completed   = useRef(false)

  useEffect(() => {
    stirRef.current = (delta: number) => {
      stirTotal.current = Math.min(stirTotal.current + delta, STIR_GOAL)
    }

    // Fallback: auto-complete after AUTO_MS
    const timer = setTimeout(() => {
      if (!completed.current) { completed.current = true; onComplete() }
    }, AUTO_MS)

    return () => { clearTimeout(timer); stirRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const mat = matRef.current
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uWarp.value = stirTotal.current / STIR_GOAL

    if (!completed.current && stirTotal.current >= STIR_GOAL) {
      completed.current = true
      onComplete()
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          uTime: { value: 0 },
          uWarp: { value: 0 },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Exported component ────────────────────────────────────────────────────────

interface Props { onComplete: () => void }

export default function LiquidOverlay({ onComplete }: Props) {
  const stirRef  = useRef<StirFn | null>(null)
  const lastPos  = useRef({ x: -1, y: -1 })
  const divRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/box_white.glb').catch(() => {})
    fetch('/vintage_telephone.glb').catch(() => {})
  }, [])

  // Touch (passive:false to preventDefault)
  useEffect(() => {
    const div = divRef.current
    if (!div) return
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      for (const t of Array.from(e.touches)) {
        stirRef.current?.(0.08)
        lastPos.current = { x: t.clientX / window.innerWidth, y: t.clientY / window.innerHeight }
      }
    }
    div.addEventListener('touchmove', onTouch, { passive: false })
    return () => div.removeEventListener('touchmove', onTouch)
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    if (lastPos.current.x >= 0) {
      const delta = Math.hypot(nx - lastPos.current.x, ny - lastPos.current.y)
      if (delta > 0.002) stirRef.current?.(delta * 3.5)
    }
    lastPos.current = { x: nx, y: ny }
  }

  return createPortal(
    <div
      ref={divRef}
      onPointerMove={handlePointerMove}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, cursor: 'crosshair' }}
    >
      <Canvas
        orthographic
        camera={{ near: -1, far: 1, zoom: 1 }}
        gl={{ antialias: true, alpha: false }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <LiquidMesh onComplete={onComplete} stirRef={stirRef} />
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
          color:         'rgba(255,255,255,0.45)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          animation:     'liqHint 2.8s ease-in-out infinite',
        }}
      >
        Stir to enter
      </div>

      <style>{`
        @keyframes liqHint {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.9;  }
        }
      `}</style>
    </div>,
    document.body,
  )
}
