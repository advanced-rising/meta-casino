import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'

import { Sky, Loader, Sparkles, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Lights from '@/models/ui/Lights'
import Character, { OtherCharacter, CharacterInput } from '@/models/Character'
import MobileControls, { MobileInput } from '@/components/dom/MobileControls'
import { useRouter } from 'next/router'
import StoneHenge from './ui/StoneHenge'
import { useImmer } from 'use-immer'
import { MAP_BLOCKS } from '@/utils/mapData'

const MAP_SIZE = 50

const SimpleBox = ({ position, args, color }: { position: [number, number, number]; args: [number, number, number]; color: string }) => (
  <mesh castShadow receiveShadow position={[position[0], position[1] + args[1] / 2, position[2]]}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} />
  </mesh>
)

const Floor = () => (
  <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
    <planeGeometry args={[MAP_SIZE * 2, MAP_SIZE * 2]} />
    <meshStandardMaterial color='#c8d6b9' />
  </mesh>
)

const SimpleTree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
      <meshStandardMaterial color='#8B4513' />
    </mesh>
    <mesh castShadow position={[0, 1.8, 0]}>
      <coneGeometry args={[0.7, 1.5, 8]} />
      <meshStandardMaterial color='#2d5a27' />
    </mesh>
    <mesh castShadow position={[0, 2.5, 0]}>
      <coneGeometry args={[0.5, 1.2, 8]} />
      <meshStandardMaterial color='#3a7a33' />
    </mesh>
  </group>
)

const Field = ({
  enteredInput,
  socket,
  clients,
  nickname,
}: {
  enteredInput: boolean
  socket: any
  clients: any
  nickname: string
}) => {
  const router = useRouter()
  const [isSet, setIsSet] = useState(false)
  const [nearSpace, setNearSpace] = useState<{ id: string; name: string; route: string } | null>(null)
  const nearSpaceRef = useRef<{ id: string; name: string; route: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') setIsSet(true)
  }, [])

  // 모바일 입력 ref
  const charInputRef = useRef<CharacterInput | null>(null)
  const mobileInputRef = useRef<MobileInput>({ dx: 0, dy: 0, magnitude: 0, active: false })

  const handleMobileJump = useCallback(() => {
    if (charInputRef.current) {
      charInputRef.current.jump = true
      setTimeout(() => { if (charInputRef.current) charInputRef.current.jump = false }, 200)
    }
  }, [])

  const handleMobileInteract = useCallback(() => {
    if (nearSpaceRef.current) {
      router.push(nearSpaceRef.current.route)
    }
  }, [router])

  // 근접 상태 콜백
  const handleNearSpace = useCallback((space: { id: string; name: string; route: string } | null) => {
    // ref로 즉시 업데이트 (렌더 사이클 무관)
    nearSpaceRef.current = space

    // state는 값이 바뀔 때만 업데이트 (불필요한 리렌더 방지)
    setNearSpace((prev) => {
      if (prev?.id === space?.id) return prev
      return space
    })
  }, [])

  // E키로 입장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearSpaceRef.current) {
        router.push(nearSpaceRef.current.route)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const [sparkel, setSparkel] = useImmer({ stone_henge: false })

  return (
    isSet &&
    clients &&
    socket && (
      <>
        <Canvas
          shadows
          camera={{
            zoom: 60,
            position: [10, 10, 10],
            near: -1000,
            far: 1000,
          }}
          orthographic
          style={{ background: '#c8d6b9' }}>
          <Stats />
          <Lights />

          <Suspense fallback={null}>
            {Object.keys(clients)
              .filter((key) => key !== socket.id)
              .map((id) => {
                const c = clients[id]
                if (!c) return null
                return (
                  <OtherCharacter
                    key={id}
                    position={c.position || [0, 0, 0]}
                    rotation={c.rotation || [0, 0, 0, 1]}
                    nickname={c.nickname || ''}
                  />
                )
              })}

            <Character
              enteredInput={enteredInput}
              socket={socket}
              nickname={nickname}
              onNearSpace={handleNearSpace}
              inputRef={charInputRef}
              mobileInputRef={mobileInputRef}
            />

            <StoneHenge
              position={[10, 0.4, 0]}
              onPointerOver={() => setSparkel((d) => { d.stone_henge = true })}
              onPointerOut={() => setSparkel((d) => { d.stone_henge = false })}
            />
            {(sparkel.stone_henge || nearSpace?.id === 'roulette') && (
              <Sparkles count={50} size={6} position={[10, 0.4, 0]} scale={[3, 1.5, 2]} speed={5} color='white' />
            )}

            {/* 게임장: 슬롯머신 */}
            <group position={[-10, 0, 10]}>
              {/* 슬롯머신 모형 */}
              <mesh castShadow receiveShadow position={[0, 1, 0]}>
                <boxGeometry args={[1.2, 2, 0.8]} />
                <meshStandardMaterial color='#6a1b9a' />
              </mesh>
              <mesh castShadow position={[0, 2.2, 0]}>
                <boxGeometry args={[1.4, 0.3, 0.9]} />
                <meshStandardMaterial color='#c9a84c' />
              </mesh>
              <mesh castShadow position={[0, 0.3, 0.5]}>
                <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
                <meshStandardMaterial color='#e74c3c' />
              </mesh>
            </group>
            {nearSpace?.id === 'slot' && (
              <Sparkles count={50} size={6} position={[-10, 0.4, 10]} scale={[3, 1.5, 2]} speed={5} color='#da70d6' />
            )}

            {/* 게임장: Mines */}
            <group position={[0, 0, -12]}>
              <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial color='#2980b9' />
              </mesh>
              <mesh castShadow position={[0, 1.6, 0]}>
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color='#3498db' emissive='#1a5276' emissiveIntensity={0.5} />
              </mesh>
            </group>
            {nearSpace?.id === 'mines' && (
              <Sparkles count={50} size={6} position={[0, 0.4, -12]} scale={[3, 1.5, 2]} speed={5} color='#3498db' />
            )}

            {/* 게임장: Crash */}
            <group position={[-12, 0, -5]}>
              <mesh castShadow receiveShadow position={[0, 1, 0]} rotation={[0, 0, 0.3]}>
                <coneGeometry args={[0.5, 2, 6]} />
                <meshStandardMaterial color='#e74c3c' />
              </mesh>
              <mesh castShadow position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.3, 8]} />
                <meshStandardMaterial color='#c0392b' />
              </mesh>
            </group>
            {nearSpace?.id === 'crash' && (
              <Sparkles count={50} size={6} position={[-12, 0.4, -5]} scale={[3, 1.5, 2]} speed={5} color='#e74c3c' />
            )}
          </Suspense>

          <Floor />

          {MAP_BLOCKS.map(([x, y, z, w, h, d], i) => {
            const colors = ['#e74c3c', '#e67e22', '#9b59b6', '#27ae60', '#3498db', '#2980b9', '#1abc9c']
            return <SimpleBox key={i} position={[x, y, z]} args={[w, h, d]} color={colors[i % colors.length]} />
          })}

          <SimpleTree position={[25, 0, 10]} />
          <SimpleTree position={[0, 0, 30]} />
          <SimpleTree position={[-25, 0, 10]} />
          <SimpleTree position={[-15, 0, -25]} />
          <SimpleTree position={[10, 0, -30]} />
          <SimpleTree position={[35, 0, -20]} />
          <SimpleTree position={[-35, 0, -30]} />
          <SimpleTree position={[20, 0, 25]} />
          <SimpleTree position={[-30, 0, 25]} />
          <SimpleTree position={[40, 0, 15]} />
          <SimpleTree position={[-10, 0, -40]} />
          <SimpleTree position={[30, 0, -35]} />

          <Sky sunPosition={[100, 50, 100]} />
        </Canvas>

        {/* 게임장 입장 UI */}
        {nearSpace && (
          <div className='fixed left-1/2 bottom-[120px] -translate-x-1/2 z-[200] animate-bounce'>
            <div className='arcade-box flex flex-col items-center gap-[6px] px-[28px] py-[14px]'
              style={{ background: '#000000ee', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
              <span className='arcade-title text-[14px] font-bold' style={{ color: '#ffd700' }}>{nearSpace.name}</span>
              <div className='flex items-center gap-[8px]'>
                <span className='arcade-btn text-[13px] font-bold w-[30px] h-[30px] rounded-[6px] flex items-center justify-center arcade-border'
                  style={{ background: '#c9a84c', color: '#000' }}>E</span>
                <span className='arcade-title text-[11px]' style={{ color: '#aaa' }}>PRESS TO ENTER</span>
              </div>
            </div>
          </div>
        )}

        {/* 모바일 조이스틱 + 버튼 */}
        <MobileControls
          mobileInputRef={mobileInputRef}
          onJump={handleMobileJump}
          onInteract={handleMobileInteract}
        />

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </>
    )
  )
}

export default Field
