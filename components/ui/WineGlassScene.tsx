'use client'

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Center } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/wine_glass.glb')

function WineGlassMesh() {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/wine_glass.glb')
  const { actions, mixer } = useAnimations(animations, group)

  const scale = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxD = Math.max(size.x, size.y, size.z) || 1
    return 2.8 / maxD
  }, [scene])

  useEffect(() => {
    Object.values(actions).forEach(a => a?.reset().play())
    return () => { mixer.stopAllAction() }
  }, [actions, mixer])

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.18
    }
  })

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

interface WineGlassSceneProps {
  visible: boolean
}

export default function WineGlassScene({ visible }: WineGlassSceneProps) {
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
          toneMappingExposure: 1.2,
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 5]}   intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]}  intensity={0.8} color="#ddeeff" />
        <pointLight       position={[0,  2, 4]}   intensity={1.5} color="#ffffff" />

        <Suspense fallback={null}>
          <Center>
            <WineGlassMesh />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  )
}
