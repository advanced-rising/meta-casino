import React, { Suspense, useEffect, useState } from 'react'
import { KeyboardControls, Loader, OrbitControls, PerspectiveCamera, softShadows } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'

import * as THREE from 'three'
import Character from './Character'
import BaseBox from './BaseBox'
import ThreeModel from './ThreeModel'
import { Physics } from '@react-three/cannon'
import Floor from './Floor'
import Lights from './Lights'

softShadows()
const Scene = ({ children }: { children: any }) => {
  const camera = new THREE.OrthographicCamera(
    -100, // left
    100, // right,
    1, // top
    -1, // bottom
    -1000,
    1000,
  )
  camera.zoom = 50

  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      const cameraPosition = new THREE.Vector3(1, 100, 100)

      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
      camera.left = -(window.innerWidth / window.innerHeight)
      camera.right = window.innerWidth / window.innerHeight

      camera.updateProjectionMatrix()
      setIsSet(true)
    }
  }, [])

  console.log('camera', camera)

  return (
    isSet &&
    camera && (
      <div className='w-full h-screen bg-white'>
        <Canvas shadows camera={camera} orthographic>
          <Lights />
          <Physics gravity={[0, -9.8, 0]}>
            <Suspense fallback={null}>
              <Character camera={camera} />

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
            {/* <fog attach='fog' color='#ffffff' near={50} far={300} /> */}
          </Physics>
        </Canvas>

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </div>
    )
  )
}

export default Scene
