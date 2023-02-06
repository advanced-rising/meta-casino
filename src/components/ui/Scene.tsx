import React, { Suspense, useEffect, useState } from 'react'
import { KeyboardControls, Loader, OrbitControls, softShadows } from '@react-three/drei'
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
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6)
  hemiLight.color.setHSL(0.6, 1, 0.6)
  hemiLight.groundColor.setHSL(0.095, 1, 0.75)

  const camera = new THREE.OrthographicCamera(
    -100, // left
    100, // right,
    5000, // top
    -5000, // bottom
    -2000,
    2000,
  )
  camera.zoom = 50

  console.log('camera', camera)

  const light = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(-100, 100, 100)
  light.target.position.set(0, 0, 0)
  light.castShadow = true
  light.shadow.bias = -0.001
  light.shadow.mapSize.width = 4096
  light.shadow.mapSize.height = 4096
  light.shadow.camera.near = -1000
  light.shadow.camera.far = 1000
  light.shadow.camera.left = -100
  light.shadow.camera.right = -100
  light.shadow.camera.top = 100
  light.shadow.camera.bottom = -100

  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      const cameraPosition = new THREE.Vector3(1, 100, 100)

      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
      camera.left = -(window.innerWidth / window.innerHeight)
      camera.right = window.innerWidth / window.innerHeight
      setIsSet(true)
    }
  }, [])

  console.log('camera', camera)

  return (
    isSet &&
    camera && (
      <div className='w-full h-screen bg-fuchsia-100'>
        <Canvas shadows camera={camera}>
          <Physics gravity={[0, -9.8, 0]}>
            <Lights />
            <Suspense fallback={null}>
              {/* <perspectiveCamera {...camera} /> */}
              <Character camera={camera} />
              <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
              <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
              <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
              <Floor rotation={[Math.PI / -2, 0, 0]} color='white' />
            </Suspense>
            {/* <fog attach='fog' color='#ffffff' near={50} far={300} /> */}
          </Physics>
        </Canvas>

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </div>
    )
  )
}

export default Scene
