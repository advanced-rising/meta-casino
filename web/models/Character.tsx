/* eslint-disable react-hooks/exhaustive-deps */
import { Text } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useCallback, useEffect, useRef } from 'react'
import { Socket as SocketTypes } from 'socket.io-client'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MAP_LIMIT, resolveCollisions, GAME_SPACES } from '@/utils/mapData'

interface Animations {
  [name: string]: {
    clip: THREE.AnimationAction
  }
}

const Character = ({
  socket,
  enteredInput,
  nickname,
  onNearSpace,
}: {
  socket: SocketTypes
  enteredInput: boolean
  nickname: string
  onNearSpace: (space: { id: string; name: string; route: string } | null) => void
}) => {
  const activeAnimation = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    dance: false,
    jump: false,
    interact: false,
  })

  const characterGroup = useRef<THREE.Group>(null!)
  const velocityY = useRef(0)
  const rotationY = useRef(0)
  const isGrounded = useRef(true)

  // 카메라 추적
  const cameraOffset = new THREE.Vector3(10, 10, 10)
  const currentCameraPos = useRef(new THREE.Vector3(10, 10, 10))

  const puffinChar = useLoader(GLTFLoader, '/assets/models/character/puffin.gltf')
  const { camera } = useThree()

  puffinChar.scene.traverse((f) => {
    f.castShadow = true
    f.receiveShadow = true
  })

  const mixerRef = useRef(new THREE.AnimationMixer(puffinChar.scene))
  const mixer = mixerRef.current

  const animations: Animations = {}
  animations['idle'] = { clip: mixer.clipAction(puffinChar.animations[0]) }
  animations['walk'] = { clip: mixer.clipAction(puffinChar.animations[7]) }
  animations['run'] = { clip: mixer.clipAction(puffinChar.animations[6]) }
  animations['dance'] = { clip: mixer.clipAction(puffinChar.animations[9]) }
  animations['jump'] = { clip: mixer.clipAction(puffinChar.animations[4]) }

  const currActionRef = useRef(animations['idle'].clip)
  const prevActionRef = useRef<THREE.AnimationAction | null>(null)
  const emitCounter = useRef(0)

  // Keyboard handlers
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const anim = activeAnimation.current
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': anim.forward = true; break
      case 'KeyA': case 'ArrowLeft': anim.left = true; break
      case 'KeyS': case 'ArrowDown': anim.backward = true; break
      case 'KeyD': case 'ArrowRight': anim.right = true; break
      case 'KeyE': anim.dance = true; anim.interact = true; break
      case 'ShiftLeft': case 'ShiftRight': anim.run = true; break
      case 'Space': anim.jump = true; break
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const anim = activeAnimation.current
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': anim.forward = false; break
      case 'KeyA': case 'ArrowLeft': anim.left = false; break
      case 'KeyS': case 'ArrowDown': anim.backward = false; break
      case 'KeyD': case 'ArrowRight': anim.right = false; break
      case 'KeyE': anim.dance = false; anim.interact = false; break
      case 'ShiftLeft': case 'ShiftRight': anim.run = false; break
      case 'Space': anim.jump = false; break
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('keyup', handleKeyUp)
    currActionRef.current.play()
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!enteredInput || !characterGroup.current) return

    const anim = activeAnimation.current
    const obj = characterGroup.current

    // --- Animation ---
    prevActionRef.current = currActionRef.current

    if (anim.dance) {
      currActionRef.current = animations['dance'].clip
    } else if (anim.jump && !isGrounded.current) {
      currActionRef.current = animations['jump'].clip
    } else if (anim.forward || anim.backward || anim.left || anim.right) {
      currActionRef.current = anim.run ? animations['run'].clip : animations['walk'].clip
    } else {
      currActionRef.current = animations['idle'].clip
    }

    if (prevActionRef.current !== currActionRef.current) {
      prevActionRef.current.fadeOut(0.2)
      currActionRef.current.reset().fadeIn(0.2).play()
    } else {
      currActionRef.current.play()
    }

    // --- Movement (직접 위치 제어) ---
    const speed = anim.run ? 14 : 7
    const rotSpeed = 4.0

    // 회전
    if (currActionRef.current !== animations['dance'].clip) {
      if (anim.left) rotationY.current += rotSpeed * delta
      if (anim.right) rotationY.current -= rotSpeed * delta
    }

    obj.rotation.y = rotationY.current

    // 이동 방향
    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current)

    let moveX = 0
    let moveZ = 0

    if (currActionRef.current !== animations['dance'].clip) {
      if (anim.forward) {
        moveX += forward.x * speed * delta
        moveZ += forward.z * speed * delta
      }
      if (anim.backward) {
        moveX -= forward.x * speed * 0.6 * delta
        moveZ -= forward.z * speed * 0.6 * delta
      }
      if ((anim.left || anim.right) && !anim.forward && !anim.backward) {
        moveX += forward.x * speed * 0.5 * delta
        moveZ += forward.z * speed * 0.5 * delta
      }
    }

    // 이전 위치 저장
    const prevPos = { x: obj.position.x, y: obj.position.y, z: obj.position.z }

    // 위치 적용
    obj.position.x += moveX
    obj.position.z += moveZ

    // 중력 + 점프
    if (anim.jump && isGrounded.current) {
      velocityY.current = 6
      isGrounded.current = false
    }

    velocityY.current -= 15 * delta // 중력
    obj.position.y += velocityY.current * delta

    // 블럭 충돌 체크
    const newPos = { x: obj.position.x, y: obj.position.y, z: obj.position.z }
    const resolved = resolveCollisions(newPos, prevPos, 0.3, 1.0)
    obj.position.x = resolved.x
    obj.position.z = resolved.z

    // 블럭 위에 착지 또는 바닥 충돌
    if (resolved.onBlock && velocityY.current <= 0) {
      obj.position.y = resolved.y
      velocityY.current = 0
      isGrounded.current = true
    } else if (obj.position.y <= 0) {
      obj.position.y = 0
      velocityY.current = 0
      isGrounded.current = true
    }

    // 맵 경계
    obj.position.x = Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, obj.position.x))
    obj.position.z = Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, obj.position.z))

    // --- 게임장 근접 감지 ---
    let nearSpace = null
    for (const space of GAME_SPACES) {
      const dx = obj.position.x - space.position[0]
      const dz = obj.position.z - space.position[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < space.radius) {
        nearSpace = { id: space.id, name: space.name, route: space.route }
        break
      }
    }
    onNearSpace(nearSpace)

    // --- Camera follow ---
    const targetCameraPos = new THREE.Vector3().copy(obj.position).add(cameraOffset)
    currentCameraPos.current.lerp(targetCameraPos, 0.08)
    camera.position.copy(currentCameraPos.current)
    camera.lookAt(obj.position)

    // --- Socket emit ---
    emitCounter.current++
    if (emitCounter.current % 3 === 0) {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current)
      socket.emit('move', {
        id: socket.id,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [q.x, q.y, q.z, q.w],
        nickname: nickname || 'unknown',
      })
    }

    mixer.update(delta)
  })

  return (
    <group ref={characterGroup}>
      <primitive object={puffinChar.scene} scale={[0.005, 0.005, 0.005]} castShadow />
      {nickname && nickname !== 'unknown' && (
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.15}
          color='white'
          anchorX='center'
          anchorY='bottom'
          outlineWidth={0.02}
          outlineColor='black'>
          {nickname}
        </Text>
      )}
    </group>
  )
}

// 다른 플레이어 캐릭터
export const OtherCharacter = ({
  position,
  rotation,
  nickname,
}: {
  position: number[]
  rotation: number[]
  nickname: string
}) => {
  const groupRef = useRef<THREE.Group>(null!)
  const puffinChar = useLoader(GLTFLoader, '/assets/models/character/puffin.gltf')
  const clonedScene = React.useMemo(() => puffinChar.scene.clone(true), [puffinChar])
  const mixerRef = useRef(new THREE.AnimationMixer(clonedScene))

  const prevPos = useRef([0, 0, 0])
  const walkAction = useRef<THREE.AnimationAction | null>(null)
  const idleAction = useRef<THREE.AnimationAction | null>(null)
  const currentAnim = useRef<'idle' | 'walk'>('idle')

  useEffect(() => {
    if (puffinChar.animations.length > 7) {
      walkAction.current = mixerRef.current.clipAction(puffinChar.animations[7])
      idleAction.current = mixerRef.current.clipAction(puffinChar.animations[0])
      idleAction.current.play()
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const targetPos = new THREE.Vector3(position[0], position[1], position[2])
    groupRef.current.position.lerp(targetPos, 0.15)

    if (rotation && rotation.length === 4) {
      const targetQuat = new THREE.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3])
      groupRef.current.quaternion.slerp(targetQuat, 0.15)
    }

    const dx = position[0] - prevPos.current[0]
    const dz = position[2] - prevPos.current[2]
    const isMoving = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01

    if (isMoving && currentAnim.current === 'idle' && walkAction.current && idleAction.current) {
      idleAction.current.fadeOut(0.2)
      walkAction.current.reset().fadeIn(0.2).play()
      currentAnim.current = 'walk'
    } else if (!isMoving && currentAnim.current === 'walk' && walkAction.current && idleAction.current) {
      walkAction.current.fadeOut(0.2)
      idleAction.current.reset().fadeIn(0.2).play()
      currentAnim.current = 'idle'
    }

    prevPos.current = [...position]
    mixerRef.current.update(delta)
  })

  clonedScene.traverse((f) => {
    f.castShadow = true
    f.receiveShadow = true
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={[0.005, 0.005, 0.005]} />
      {nickname && (
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.15}
          color='#FFD700'
          anchorX='center'
          anchorY='bottom'
          outlineWidth={0.02}
          outlineColor='black'>
          {nickname}
        </Text>
      )}
    </group>
  )
}

export default Character
