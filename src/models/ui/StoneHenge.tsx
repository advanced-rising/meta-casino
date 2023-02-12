import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import React, { useRef } from 'react'
import { MeshProps, useFrame, useLoader } from '@react-three/fiber'

const StoneHenge = ({ ...props }: MeshProps) => {
  const ref = useRef<any>(!!null)
  const stoneHenge = useLoader(GLTFLoader, '/assets/models/stone_henge/scene.gltf')

  stoneHenge.scene.traverse((f) => {
    f.castShadow = true
    f.receiveShadow = true
  })

  useFrame((state, delta) => {
    ref.current.rotation.y += 1 * delta
  })

  return (
    <mesh ref={ref} {...props}>
      <primitive object={stoneHenge.scene} scale={[1, 1, 1]} />
    </mesh>
  )
}

export default StoneHenge
