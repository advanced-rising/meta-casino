/* eslint-disable react-hooks/exhaustive-deps */
import { Text } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useCallback, useEffect, useRef } from 'react'
import { Socket as SocketTypes } from 'socket.io-client'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MAP_LIMIT, resolveCollisions, GAME_SPACES } from '@/utils/mapData'
import { MobileInput } from '@/components/dom/MobileControls'

interface Animations {
  [name: string]: {
    clip: THREE.AnimationAction
  }
}

export interface CharacterInput {
  forward: boolean; backward: boolean; left: boolean; right: boolean
  run: boolean; dance: boolean; jump: boolean; interact: boolean
}

const Character = ({
  socket,
  enteredInput,
  nickname,
  onNearSpace,
  inputRef,
  mobileInputRef,
  clickTarget,
}: {
  socket: SocketTypes
  enteredInput: boolean
  nickname: string
  onNearSpace: (space: { id: string; name: string; route: string } | null) => void
  inputRef?: React.MutableRefObject<CharacterInput | null>
  mobileInputRef?: React.MutableRefObject<MobileInput>
  clickTarget?: React.MutableRefObject<{ x: number; z: number } | null>
}) => {
  const activeAnimation = useRef<CharacterInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    dance: false,
    jump: false,
    interact: false,
  })

  // 외부에서 입력 접근 가능하도록
  useEffect(() => {
    if (inputRef) inputRef.current = activeAnimation.current
  }, [])

  const characterGroup = useRef<THREE.Group>(null!)
  const velocityY = useRef(0)
  const rotationY = useRef(0)
  const isGrounded = useRef(true)
  const positionSaved = useRef(false)

  // 비행 시스템
  const isFlying = useRef(false)
  const flyTimer = useRef(0)
  const spaceHoldTime = useRef(0)
  const FLY_HOLD_THRESHOLD = 0.5 // 0.5초 꾹 누르면 비행
  const FLY_DURATION = 3 // 3초 비행
  const FLY_HEIGHT = 5

  // 초기 위치 복원
  useEffect(() => {
    if (typeof window === 'undefined' || !characterGroup.current) return
    try {
      const saved = localStorage.getItem('meta-casino-char-pos')
      if (saved) {
        const [x, , z] = JSON.parse(saved)
        characterGroup.current.position.set(x, 0, z)
      }
    } catch {}
  }, [])

  // 카메라 추적 (캐릭터 뒤쪽에서 따라감)
  const cameraDistance = 12
  const cameraHeight = 8
  const currentCameraPos = useRef(new THREE.Vector3(0, cameraHeight, cameraDistance))
  const currentLookAt = useRef(new THREE.Vector3())

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

    // --- Movement ---
    const speed = anim.run ? 14 : 7
    const rotSpeed = 4.0
    let moveX = 0
    let moveZ = 0
    let isMoving = false

    // 키보드/모바일 입력 시 클릭 이동 취소
    const hasKeyInput = anim.forward || anim.backward || anim.left || anim.right
    const hasMobileInput = mobileInputRef?.current?.active
    if ((hasKeyInput || hasMobileInput) && clickTarget?.current) {
      clickTarget.current = null
    }

    // 클릭 이동
    const ct = clickTarget?.current
    if (ct && !hasKeyInput && !hasMobileInput) {
      const dx = ct.x - obj.position.x
      const dz = ct.z - obj.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist > 0.5) {
        const spd = dist > 3 ? 10 : 5
        moveX = (dx / dist) * spd * delta
        moveZ = (dz / dist) * spd * delta
        // 부드러운 회전 (급회전 방지)
        const targetRot = Math.atan2(dx, dz)
        const diff = targetRot - rotationY.current
        const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
        rotationY.current += wrapped * 5 * delta
        isMoving = true
        anim.run = dist > 3
      } else {
        clickTarget.current = null // 도착
      }
    }

    // 모바일 조이스틱 입력
    const mobile = mobileInputRef?.current
    if (mobile && mobile.active) {
      const mobileSpeed = mobile.magnitude > 0.7 ? 14 : 7

      // 화면 방향 → 월드 좌표 변환 (아이소메트릭 카메라 45도)
      // 화면 오른쪽(+dx) = 월드 (+x, -z) / 화면 아래(+dy) = 월드 (+x, +z)
      const SIN45 = 0.7071
      const worldX = (mobile.dx + mobile.dy) * SIN45
      const worldZ = (-mobile.dx + mobile.dy) * SIN45

      moveX = worldX * mobileSpeed * delta * mobile.magnitude
      moveZ = worldZ * mobileSpeed * delta * mobile.magnitude

      // 캐릭터가 이동 방향을 바라보도록
      rotationY.current = Math.atan2(worldX, worldZ)
      isMoving = true
      anim.run = mobile.magnitude > 0.7
    } else {
      // 키보드: W=앞, S=뒤, A=좌회전, D=우회전 (MMORPG 스타일)
      if (currActionRef.current !== animations['dance'].clip) {
        // A/D로 캐릭터 회전
        if (anim.left) rotationY.current += 3.0 * delta
        if (anim.right) rotationY.current -= 3.0 * delta

        // 캐릭터가 바라보는 방향 기준 이동
        const fwd = new THREE.Vector3(Math.sin(rotationY.current), 0, Math.cos(rotationY.current))
        if (anim.forward) {
          moveX += fwd.x * speed * delta
          moveZ += fwd.z * speed * delta
          isMoving = true
        }
        if (anim.backward) {
          moveX -= fwd.x * speed * 0.6 * delta
          moveZ -= fwd.z * speed * 0.6 * delta
          isMoving = true
        }
        // A/D만 누르면 좌우 스트레이프
        if ((anim.left || anim.right) && !anim.forward && !anim.backward) {
          moveX += fwd.x * speed * 0.4 * delta
          moveZ += fwd.z * speed * 0.4 * delta
          isMoving = true
        }
      }
    }

    obj.rotation.y = rotationY.current

    // --- Animation ---
    prevActionRef.current = currActionRef.current

    if (anim.dance) {
      currActionRef.current = animations['dance'].clip
    } else if (anim.jump && !isGrounded.current) {
      currActionRef.current = animations['jump'].clip
    } else if (isMoving || anim.forward || anim.backward || anim.left || anim.right) {
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

    // 이전 위치 저장
    const prevPos = { x: obj.position.x, y: obj.position.y, z: obj.position.z }

    // 위치 적용
    obj.position.x += moveX
    obj.position.z += moveZ

    // 비행 시스템: Space 꾹 누르기 감지
    if (anim.jump) {
      spaceHoldTime.current += delta
    } else {
      spaceHoldTime.current = 0
    }

    // 비행 시작 (Space 0.5초 이상 꾹 + 지상에서)
    if (spaceHoldTime.current >= FLY_HOLD_THRESHOLD && !isFlying.current && isGrounded.current) {
      isFlying.current = true
      flyTimer.current = FLY_DURATION
      velocityY.current = 4
      isGrounded.current = false
    }

    if (isFlying.current) {
      flyTimer.current -= delta
      // 비행 중: 높이 유지 + 서서히 하강
      if (flyTimer.current > 0) {
        if (obj.position.y < FLY_HEIGHT) {
          velocityY.current = 3
        } else {
          velocityY.current = Math.sin(flyTimer.current * 3) * 0.5 // 살짝 흔들림
        }
      } else {
        // 비행 종료 → 자연 낙하
        isFlying.current = false
      }
    } else {
      // 일반 점프 (짧게 누르기)
      if (anim.jump && isGrounded.current && spaceHoldTime.current < FLY_HOLD_THRESHOLD) {
        velocityY.current = 6
        isGrounded.current = false
      }
    }

    velocityY.current -= (isFlying.current ? 5 : 15) * delta // 비행 중 약한 중력
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
      isFlying.current = false
    } else if (obj.position.y <= 0) {
      obj.position.y = 0
      velocityY.current = 0
      isGrounded.current = true
      isFlying.current = false
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

    // --- Camera follow (MMORPG 스타일: 캐릭터 뒤쪽에서 따라감) ---
    // 캐릭터가 바라보는 방향의 반대쪽(뒤) + 위에서
    const behindOffset = new THREE.Vector3(
      -Math.sin(rotationY.current) * cameraDistance,
      cameraHeight,
      -Math.cos(rotationY.current) * cameraDistance,
    )
    const targetCameraPos = new THREE.Vector3().copy(obj.position).add(behindOffset)
    const targetLookAt = new THREE.Vector3(
      obj.position.x + Math.sin(rotationY.current) * 3,
      obj.position.y + 1,
      obj.position.z + Math.cos(rotationY.current) * 3,
    )

    currentCameraPos.current.lerp(targetCameraPos, 0.03)
    currentLookAt.current.lerp(targetLookAt, 0.03)
    camera.position.copy(currentCameraPos.current)
    camera.lookAt(currentLookAt.current)

    // --- Socket emit ---
    emitCounter.current++
    if (emitCounter.current % 3 === 0 && socket?.connected) {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current)
      socket.emit('move', {
        id: socket.id,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [q.x, q.y, q.z, q.w],
        nickname: nickname || 'unknown',
      })
    }

    // 위치 저장 (60프레임마다 = ~1초)
    if (emitCounter.current % 60 === 0 && typeof window !== 'undefined') {
      localStorage.setItem('meta-casino-char-pos', JSON.stringify([obj.position.x, obj.position.y, obj.position.z]))
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
