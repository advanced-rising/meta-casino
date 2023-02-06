import React, { Suspense, useEffect, useState } from 'react'
import { KeyboardControls, Loader, OrbitControls, PerspectiveCamera, softShadows } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'

import * as THREE from 'three'

import Lights from './ui/Lights'
import { Physics } from '@react-three/cannon'
import Floor from './ui/Floor'
import BaseBox from './ui/BaseBox'
import ThreeModel from './ui/Tree'
import Character from './Character'

softShadows()
const Scene = ({ children }: { children: any }) => {
  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      const cameraPosition = new THREE.Vector3(1, 100, 100)

      setIsSet(true)
    }
  }, [])

  return (
    isSet && (
      <div className='w-full h-screen bg-white'>
        <Canvas
          shadows={'soft'}
          camera={{
            zoom: 100,
            position: [1, 5, 5],
            left: -(window.innerWidth / window.innerHeight),
            right: window.innerWidth / window.innerHeight,
            top: 1,
            bottom: -1,
            near: -1000,
            far: 1000,
          }}
          orthographic>
          <Lights />
          <Physics gravity={[0, -9.8, 0]}>
            <Suspense fallback={null}>
              <Character />

              <Floor rotation={[Math.PI / -2, 0, 0]} color='white' />
            </Suspense>
            <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
            <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
            <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
            <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
            <fog attach='fog' color='#ffffff' near={50} far={300} />
          </Physics>
        </Canvas>

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </div>
    )
  )
}

export default Scene
