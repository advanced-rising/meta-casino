import { useBox, useSphere } from '@react-three/cannon'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import usePlayerControls from '@/templates/hooks/usePlayerControls'

import * as THREE from 'three'
import { useGLTF, useKeyboardControls } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const BaseCharacter = ({ socket, id, enteredInput, ...props }) => {
  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()
  const speed = new THREE.Vector3()

  const SPEED = 5

  const { camera } = useThree()

  const [ref, api] = useBox((index) => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 10, 0],
    ...props,
  }))

  const { forward, backward, left, right, jump, mouse, touch } = usePlayerControls()

  const velocity = useRef([0, 0, 0])
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [])

  useFrame((state) => {
    if (enteredInput) {
      ref.current.getWorldPosition(camera.position)
      frontVector.set(0, 0, Number(backward) - Number(forward))
      sideVector.set(Number(left) - Number(right), 0, 0)
      direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(camera.rotation)
      speed.fromArray(velocity.current)

      // socket.emit('move', {
      //   id: socket.id,
      //   rotation: [camera.quaternion._x, camera.quaternion._y, camera.quaternion._z, camera.quaternion._w],
      //   position: [camera.position.x, camera.position.y, camera.position.z],
      // })

      api.velocity.set(direction.x, velocity.current[1], direction.z)
      if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05)
        api.velocity.set(velocity.current[0], 5, velocity.current[2])
    }
  })
  const gltf = useLoader(GLTFLoader, '/assets/models/puffin.gltf')
  console.log('gltf', gltf)

  const mixer = new THREE.AnimationMixer(gltf.scene)
  void mixer.clipAction(gltf.animations[6]).play()

  useFrame((state, delta) => {
    mixer.update(delta)
    // console.log(ca);
  })

  return (
    <group>
      {/* <mesh
        
        scale={props.scale}
        
        receiveShadow
        geometry={nodes['tree-beech'].geometry}
        material={materials.color_main}
      /> */}
      <mesh lookAt={frontVector} ref={ref}>
        <Suspense fallback={gltf}>
          <primitive
            object={gltf.scene}
            scale={[0.005, 0.005, 0.005]}
            position={props.position}
            castShadow
            rotation={[0, 0, 0, 0]}
          />
        </Suspense>
      </mesh>
    </group>
  )
}

export default BaseCharacter
