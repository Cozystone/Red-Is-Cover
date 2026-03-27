'use client'

/* WhiteRoomScene — bright white studio space with box_white.glb pedestal
   and vintage_telephone.glb resting on top. The group rotates slowly.
   ESC or clicking the close button exits back to idle. */

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/box_white.glb')
useGLTF.preload('/vintage_telephone.glb')

// ── Scene internals ──────────────────────────────────────────────────────────

function fitObject(obj: THREE.Object3D, targetSize: number): number {
  const box  = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const s    = targetSize / (Math.max(size.x, size.y, size.z) || 1)
  obj.scale.setScalar(s)
  obj.updateMatrixWorld(true)
  const box2 = new THREE.Box3().setFromObject(obj)
  const ctr  = box2.getCenter(new THREE.Vector3())
  obj.position.x -= ctr.x
  obj.position.z -= ctr.z
  obj.position.y -= box2.min.y   // sit on y=0
  return box2.max.y - box2.min.y // return height after fitting
}

function Display() {
  const { scene: boxSrc }   = useGLTF('/box_white.glb')
  const { scene: phoneSrc } = useGLTF('/vintage_telephone.glb')
  const groupRef = useRef<THREE.Group>(null)

  const { boxMesh, phoneObj, pedestalH } = useMemo(() => {
    const box   = boxSrc.clone(true)
    const phone = phoneSrc.clone(true)

    // Whiten box material + enable shadows
    box.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow    = true
        c.receiveShadow = true
        if (c.material) {
          const m = (Array.isArray(c.material) ? c.material[0] : c.material) as THREE.MeshStandardMaterial
          if (m.isMeshStandardMaterial) {
            m.color.set(0xffffff)
            m.roughness  = 0.15
            m.metalness  = 0.0
            m.needsUpdate = true
          }
        }
      }
    })

    phone.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.castShadow    = true
        c.receiveShadow = true
      }
    })

    const pedestalH = fitObject(box,   0.72)
    fitObject(phone, 0.34)

    // fitObject places bottom at y=0; shift up by pedestalH to sit on top of pedestal
    phone.position.y += pedestalH

    return { boxMesh: box, phoneObj: phone, pedestalH }
  }, [boxSrc, phoneSrc])

  // Slow Y-axis rotation
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.25
  })

  return (
    <group ref={groupRef}>
      <primitive object={boxMesh} />
      <primitive object={phoneObj} />
    </group>
  )
}

// ── Exported component ────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export default function WhiteRoomScene({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9001,
        background: '#f8f8f6',
        animation:  'wrFadeIn 0.5s ease-out forwards',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.2, 2.6], fov: 38 }}
        shadows
        gl={{
          antialias:           true,
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference:     'high-performance',
        }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={2.5} color="#ffffff" />
        <directionalLight position={[4, 10, 6]} intensity={3.5}
          castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024}
          shadow-camera-near={0.5} shadow-camera-far={30}
          shadow-camera-left={-4} shadow-camera-right={4}
          shadow-camera-top={4} shadow-camera-bottom={-4}
          shadow-bias={-0.002}
        />
        <directionalLight position={[-5, 6, -4]} intensity={2}   color="#e8eeff" />
        <directionalLight position={[0, -3, 4]}  intensity={0.8} color="#fff8f0" />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f5f5f3" roughness={0.9} />
        </mesh>

        <Suspense fallback={null}>
          <Display />
        </Suspense>
      </Canvas>

      {/* ESC / close hint */}
      <div
        onClick={onClose}
        style={{
          position:      'absolute',
          top:           'clamp(20px, 3vh, 36px)',
          right:         'clamp(20px, 3vw, 36px)',
          fontFamily:    "'Helvetica Neue', Helvetica, sans-serif",
          fontSize:      '9px',
          fontWeight:    500,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color:         'rgba(0,0,0,0.35)',
          cursor:        'pointer',
          userSelect:    'none',
          padding:       '12px',
          transition:    'color 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.35)' }}
      >
        ESC · Close
      </div>

      {/* Label */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          bottom:        'clamp(28px, 5vh, 56px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontFamily:    "'Cormorant Garamond', Georgia, serif",
          fontSize:      'clamp(11px, 1.4vw, 16px)',
          fontStyle:     'italic',
          letterSpacing: '0.22em',
          color:         'rgba(0,0,0,0.3)',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >
        골목길 / Golmok-gil
      </div>

      <style>{`
        @keyframes wrFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  )
}
