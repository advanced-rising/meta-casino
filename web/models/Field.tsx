import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'

import { Sky, Loader, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Lights from '@/models/ui/Lights'
import Character, { OtherCharacter, CharacterInput } from '@/models/Character'
import MobileControls, { MobileInput } from '@/components/dom/MobileControls'
import { useRouter } from 'next/router'
import { RouletteTable, SlotCabinet, MineRock, RocketPad, CardTable, GiantCoin } from './ui/GameLandmarks'
import { MAP_BLOCKS } from '@/utils/mapData'

const MAP_SIZE = 50

const SimpleBox = ({ position, args, color }: { position: [number, number, number]; args: [number, number, number]; color: string }) => (
  <mesh castShadow receiveShadow position={[position[0], position[1] + args[1] / 2, position[2]]}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} />
  </mesh>
)

const Floor = ({ onClick }: { onClick?: (e: any) => void }) => (
  <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={onClick}>
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
  const clickTargetRef = useRef<{ x: number; z: number } | null>(null)

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

  // 위치 저장 후 입장 (위치는 Character의 useFrame에서 이미 저장됨)
  const enterGame = useCallback(() => {
    if (!nearSpaceRef.current) return
    router.push(nearSpaceRef.current.route)
  }, [router])

  // E키로 입장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearSpaceRef.current) enterGame()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router, enterGame])


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
              clickTarget={clickTargetRef}
            />

            {/* 게임장: 룰렛 테이블 */}
            <RouletteTable position={[15, 0, 0]} />
            {nearSpace?.id === 'roulette' && (
              <Sparkles count={60} size={6} position={[15, 1, 0]} scale={[3, 2, 3]} speed={5} color='#2ecc71' />
            )}

            <SlotCabinet position={[-15, 0, 15]} />
            {nearSpace?.id === 'slot' && (
              <Sparkles count={60} size={6} position={[-15, 1.5, 15]} scale={[3, 3, 3]} speed={5} color='#da70d6' />
            )}

            <MineRock position={[0, 0, -18]} />
            {nearSpace?.id === 'mines' && (
              <Sparkles count={60} size={6} position={[0, 1, -18]} scale={[3, 2, 3]} speed={5} color='#3498db' />
            )}

            <RocketPad position={[-18, 0, -12]} />
            {nearSpace?.id === 'crash' && (
              <Sparkles count={60} size={6} position={[-18, 1, -12]} scale={[3, 2, 3]} speed={5} color='#e74c3c' />
            )}

            <CardTable position={[18, 0, -15]} />
            {nearSpace?.id === 'hilo' && (
              <Sparkles count={60} size={6} position={[18, 1, -15]} scale={[3, 2, 3]} speed={5} color='#2ecc71' />
            )}

            <GiantCoin position={[15, 0, 18]} />
            {nearSpace?.id === 'coinflip' && (
              <Sparkles count={60} size={6} position={[15, 1, 18]} scale={[3, 2, 3]} speed={5} color='#ffd700' />
            )}
          </Suspense>

          <Floor onClick={(e: any) => {
            if (e.point) clickTargetRef.current = { x: e.point.x, z: e.point.z }
          }} />

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

          {/* 맵 경계 벽 */}
          {[
            { pos: [MAP_SIZE, 1, 0] as [number, number, number], args: [0.3, 2, MAP_SIZE * 2] as [number, number, number] },
            { pos: [-MAP_SIZE, 1, 0] as [number, number, number], args: [0.3, 2, MAP_SIZE * 2] as [number, number, number] },
            { pos: [0, 1, MAP_SIZE] as [number, number, number], args: [MAP_SIZE * 2, 2, 0.3] as [number, number, number] },
            { pos: [0, 1, -MAP_SIZE] as [number, number, number], args: [MAP_SIZE * 2, 2, 0.3] as [number, number, number] },
          ].map(({ pos, args }, i) => (
            <mesh key={`wall-${i}`} castShadow receiveShadow position={pos}>
              <boxGeometry args={args} />
              <meshStandardMaterial color='#5a4a3a' roughness={0.9} />
            </mesh>
          ))}
          {/* 벽 위 장식 라인 */}
          {[
            { pos: [MAP_SIZE, 2.05, 0] as [number, number, number], args: [0.4, 0.1, MAP_SIZE * 2] as [number, number, number] },
            { pos: [-MAP_SIZE, 2.05, 0] as [number, number, number], args: [0.4, 0.1, MAP_SIZE * 2] as [number, number, number] },
            { pos: [0, 2.05, MAP_SIZE] as [number, number, number], args: [MAP_SIZE * 2, 0.1, 0.4] as [number, number, number] },
            { pos: [0, 2.05, -MAP_SIZE] as [number, number, number], args: [MAP_SIZE * 2, 0.1, 0.4] as [number, number, number] },
          ].map(({ pos, args }, i) => (
            <mesh key={`wallcap-${i}`} position={pos}>
              <boxGeometry args={args} />
              <meshStandardMaterial color='#8B6914' metalness={0.3} />
            </mesh>
          ))}

          <Sky sunPosition={[100, 50, 100]} />
        </Canvas>

        {/* 게임장 입장 UI (클릭 또는 E키) */}
        {nearSpace && (
          <div className='fixed left-1/2 bottom-[120px] -translate-x-1/2 z-[200]'>
            <button onClick={enterGame}
              className='arcade-box arcade-btn flex flex-col items-center gap-[6px] px-[28px] py-[14px] cursor-pointer hover:scale-105 transition-transform'
              style={{ background: '#000000ee', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
              <span className='arcade-title text-[14px] font-bold' style={{ color: '#ffd700' }}>{nearSpace.name}</span>
              <div className='flex items-center gap-[8px]'>
                <span className='text-[12px] font-bold w-[26px] h-[26px] rounded-[5px] flex items-center justify-center'
                  style={{ background: '#c9a84c', color: '#000' }}>E</span>
                <span className='arcade-title text-[11px]' style={{ color: '#aaa' }}>CLICK OR PRESS E</span>
              </div>
            </button>
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
