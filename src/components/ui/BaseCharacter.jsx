import { useSphere } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import usePlayerControls from '@/templates/hooks/usePlayerControls'

import * as THREE from 'three'

const BaseCharacter = ({ socket, id, enteredInput, ...props }) => {
  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()
  const speed = new THREE.Vector3()

  const SPEED = 5

  const { camera } = useThree()

  const [ref, api] = useSphere((index) => ({
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

      socket.emit('move', {
        id: socket.id,
        rotation: [camera.quaternion._x, camera.quaternion._y, camera.quaternion._z, camera.quaternion._w],
        position: [camera.position.x, camera.position.y, camera.position.z],
      })

      api.velocity.set(direction.x, velocity.current[1], direction.z)
      if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05)
        api.velocity.set(velocity.current[0], 5, velocity.current[2])
    }
  })

  // // 마우스 좌표를 three.js에 맞게 변환
  // function calculateMousePosition(e) {
  //   mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1
  //   mouse.y = -((e.clientY / canvas.clientHeight) * 2 - 1)
  // }

  // // 변환된 마우스 좌표를 이용해 래이캐스팅
  // function raycasting() {
  //   raycaster.setFromCamera(mouse, camera)
  //   checkIntersects()
  // }

  // // 마우스 이벤트
  // canvas.addEventListener('mousedown', (e) => {
  //   isPressed = true
  //   calculateMousePosition(e)
  // })
  // canvas.addEventListener('mouseup', () => {
  //   isPressed = false
  // })
  // canvas.addEventListener('mousemove', (e) => {
  //   if (isPressed) {
  //     calculateMousePosition(e)
  //   }
  // })

  // // 터치 이벤트
  // canvas.addEventListener('touchstart', (e) => {
  //   isPressed = true
  //   calculateMousePosition(e.touches[0])
  // })
  // canvas.addEventListener('touchend', () => {
  //   isPressed = false
  // })
  // canvas.addEventListener('touchmove', (e) => {
  //   if (isPressed) {
  //     calculateMousePosition(e.touches[0])
  //   }
  // })

  return (
    <group>
      <mesh castShadow position={props.position} ref={ref}>
        <sphereGeometry args={props.args} />
        <meshStandardMaterial color='#FFFF00' />
      </mesh>
    </group>
  )
}

export default BaseCharacter
