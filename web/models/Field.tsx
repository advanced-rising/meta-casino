import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'

import { Sky, Loader, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Lights from '@/models/ui/Lights'
import Character, { OtherCharacter, CharacterInput } from '@/models/Character'
import MobileControls, { MobileInput } from '@/components/dom/MobileControls'
import { useRouter } from 'next/router'
import { RouletteTable, SlotCabinet, MineRock, RocketPad, CardTable, GiantCoin, GiantDice, WheelStand, PlinkoBoard, BlackjackTable, BaccaratTable, RPSStand, RaceTrack } from './ui/GameLandmarks'
import { VISIBLE_BLOCKS } from '@/utils/mapData'

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

// 가로등
const Lamp = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.05, 0.06, 3, 6]} />
      <meshStandardMaterial color='#444' metalness={0.7} />
    </mesh>
    <mesh castShadow position={[0, 3.1, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color='#ffeaa7' emissive='#ffd700' emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.1, 8]} />
      <meshStandardMaterial color='#333' />
    </mesh>
  </group>
)

// 벤치
const Bench = ({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
      <boxGeometry args={[1.2, 0.06, 0.4]} />
      <meshStandardMaterial color='#8B4513' />
    </mesh>
    <mesh castShadow position={[0, 0.6, -0.18]}>
      <boxGeometry args={[1.2, 0.5, 0.06]} />
      <meshStandardMaterial color='#8B4513' />
    </mesh>
    {[-0.5, 0.5].map((x, i) => (
      <mesh key={i} castShadow position={[x, 0.17, 0]}>
        <boxGeometry args={[0.06, 0.34, 0.36]} />
        <meshStandardMaterial color='#333' metalness={0.5} />
      </mesh>
    ))}
  </group>
)

// 분수
const Fountain = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
      <cylinderGeometry args={[1.5, 1.8, 0.4, 16]} />
      <meshStandardMaterial color='#888' roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[1.3, 1.3, 0.2, 16]} />
      <meshStandardMaterial color='#4a90d9' transparent opacity={0.6} />
    </mesh>
    <mesh castShadow position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
      <meshStandardMaterial color='#999' />
    </mesh>
    <mesh castShadow position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.1, 12]} />
      <meshStandardMaterial color='#888' />
    </mesh>
    <mesh position={[0, 1.15, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.08, 12]} />
      <meshStandardMaterial color='#4a90d9' transparent opacity={0.5} />
    </mesh>
  </group>
)

// 도로 (직선)
const Road = ({ position, length, horizontal = false }: { position: [number, number, number]; length: number; horizontal?: boolean }) => (
  <group position={position}>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, horizontal ? Math.PI / 2 : 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[2, length]} />
      <meshStandardMaterial color='#555' />
    </mesh>
    {/* 중앙선 */}
    <mesh rotation={[-Math.PI / 2, 0, horizontal ? Math.PI / 2 : 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[0.1, length]} />
      <meshStandardMaterial color='#ffd700' />
    </mesh>
  </group>
)

// 화단
const FlowerBed = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
      <boxGeometry args={[2, 0.3, 1]} />
      <meshStandardMaterial color='#5d3a1a' />
    </mesh>
    {[[-0.6, 0, 0.2], [0, 0, -0.2], [0.6, 0, 0.1], [-0.3, 0, 0], [0.3, 0, -0.1]].map(([x, , z], i) => (
      <mesh key={i} castShadow position={[x, 0.45, z]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color={['#e74c3c', '#f39c12', '#e91e63', '#9b59b6', '#2ecc71'][i]} />
      </mesh>
    ))}
  </group>
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

            <GiantDice position={[-20, 0, 20]} />
            {nearSpace?.id === 'dice' && (
              <Sparkles count={60} size={6} position={[-20, 1, 20]} scale={[3, 2, 3]} speed={5} color='#2ecc71' />
            )}

            <WheelStand position={[20, 0, 20]} />
            {nearSpace?.id === 'wheel' && (
              <Sparkles count={60} size={6} position={[20, 1.5, 20]} scale={[3, 3, 3]} speed={5} color='#e91e63' />
            )}

            <PlinkoBoard position={[30, 0, -20]} />
            {nearSpace?.id === 'plinko' && (
              <Sparkles count={60} size={6} position={[30, 1.5, -20]} scale={[3, 3, 3]} speed={5} color='#f39c12' />
            )}

            <BlackjackTable position={[-30, 0, 0]} />
            {nearSpace?.id === 'blackjack' && (
              <Sparkles count={60} size={6} position={[-30, 1, 0]} scale={[3, 2, 3]} speed={5} color='#2ecc71' />
            )}

            <BaccaratTable position={[0, 0, 25]} />
            {nearSpace?.id === 'baccarat' && (
              <Sparkles count={60} size={6} position={[0, 1, 25]} scale={[3, 2, 3]} speed={5} color='#c9a84c' />
            )}

            <RPSStand position={[-25, 0, -25]} />
            {nearSpace?.id === 'rps' && (
              <Sparkles count={60} size={6} position={[-25, 1, -25]} scale={[3, 2, 3]} speed={5} color='#f39c12' />
            )}

            <RaceTrack position={[25, 0, -25]} />
            {nearSpace?.id === 'horserace' && (
              <Sparkles count={60} size={6} position={[25, 1, -25]} scale={[3, 2, 3]} speed={5} color='#2ecc71' />
            )}

            {/* Tower */}
            <group position={[35, 0, 10]}>
              {[0, 0.5, 1, 1.5].map((y, i) => (
                <mesh key={i} castShadow position={[0, y + 0.25, 0]}>
                  <boxGeometry args={[1.2 - i * 0.15, 0.5, 1.2 - i * 0.15]} />
                  <meshStandardMaterial color={['#9b59b6', '#8e44ad', '#7d3c98', '#6c3483'][i]} />
                </mesh>
              ))}
            </group>
            {nearSpace?.id === 'tower' && <Sparkles count={60} size={6} position={[35, 1.5, 10]} scale={[3, 3, 3]} speed={5} color='#9b59b6' />}

            {/* Scratch Card */}
            <group position={[-35, 0, -10]}>
              <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[1.2, 0.05, 0.8]} />
                <meshStandardMaterial color='#f39c12' metalness={0.3} />
              </mesh>
              <mesh castShadow position={[0, 0.7, 0]}>
                <boxGeometry args={[0.8, 0.02, 0.5]} />
                <meshStandardMaterial color='#c9a84c' metalness={0.5} />
              </mesh>
            </group>
            {nearSpace?.id === 'scratch' && <Sparkles count={60} size={6} position={[-35, 1, -10]} scale={[3, 2, 3]} speed={5} color='#f39c12' />}

            {/* Limbo */}
            <group position={[10, 0, 35]}>
              <mesh castShadow position={[0, 1, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 2, 6]} />
                <meshStandardMaterial color='#3498db' />
              </mesh>
              <mesh castShadow position={[0, 2.1, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color='#e74c3c' emissive='#e74c3c' emissiveIntensity={0.3} />
              </mesh>
            </group>
            {nearSpace?.id === 'limbo' && <Sparkles count={60} size={6} position={[10, 1, 35]} scale={[3, 2, 3]} speed={5} color='#3498db' />}

            {/* Color Predict */}
            <group position={[-10, 0, -35]}>
              {[[-0.3, '#e74c3c'], [0, '#2ecc71'], [0.3, '#9b59b6']].map(([x, c], i) => (
                <mesh key={i} castShadow position={[x as number, 0.5 + i * 0.2, 0]}>
                  <sphereGeometry args={[0.25, 8, 8]} />
                  <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.3} />
                </mesh>
              ))}
            </group>
            {nearSpace?.id === 'colorpredict' && <Sparkles count={60} size={6} position={[-10, 1, -35]} scale={[3, 2, 3]} speed={5} color='#e91e63' />}

            {/* Bomb Defuse */}
            <group position={[35, 0, 35]}>
              <mesh castShadow position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial color='#1a1a1a' />
              </mesh>
              <mesh castShadow position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
                <meshStandardMaterial color='#c9a84c' />
              </mesh>
            </group>
            {nearSpace?.id === 'bombdefuse' && <Sparkles count={60} size={6} position={[35, 1, 35]} scale={[3, 2, 3]} speed={5} color='#e74c3c' />}

            {/* Keno */}
            <group position={[-35, 0, 30]}>
              <mesh castShadow receiveShadow position={[0, 0.5, 0]}><sphereGeometry args={[0.5, 12, 12]} /><meshStandardMaterial color='#3b82f6' /></mesh>
              {[0,1,2].map(i => (<mesh key={i} castShadow position={[Math.cos(i*2.1)*0.3, 0.9, Math.sin(i*2.1)*0.3]}>
                <sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color={['#ef4444','#22c55e','#eab308'][i]} /></mesh>))}
            </group>
            {nearSpace?.id === 'keno' && <Sparkles count={60} size={6} position={[-35, 1, 30]} scale={[3, 2, 3]} speed={5} color='#3b82f6' />}

            {/* War */}
            <group position={[40, 0, -30]}>
              <mesh castShadow position={[0, 0.8, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.1, 1.4, 0.05]} /><meshStandardMaterial color='#888' metalness={0.7} /></mesh>
              <mesh castShadow position={[0, 1.5, 0]}><boxGeometry args={[0.4, 0.1, 0.05]} /><meshStandardMaterial color='#888' metalness={0.7} /></mesh>
            </group>
            {nearSpace?.id === 'war' && <Sparkles count={60} size={6} position={[40, 1, -30]} scale={[3, 2, 3]} speed={5} color='#ef4444' />}

            {/* Number Guess */}
            <group position={[-40, 0, -20]}>
              <mesh castShadow receiveShadow position={[0, 0.6, 0]}><boxGeometry args={[0.8, 1, 0.15]} /><meshStandardMaterial color='#a855f7' /></mesh>
              <mesh position={[0, 0.6, 0.09]}><boxGeometry args={[0.5, 0.3, 0.01]} /><meshStandardMaterial color='#fff' /></mesh>
            </group>
            {nearSpace?.id === 'numberguess' && <Sparkles count={60} size={6} position={[-40, 1, -20]} scale={[3, 2, 3]} speed={5} color='#a855f7' />}

            {/* Wheel of Death */}
            <group position={[0, 0, -40]}>
              <mesh castShadow receiveShadow position={[0, 0.4, 0]}><cylinderGeometry args={[0.5, 0.5, 0.15, 6]} /><meshStandardMaterial color='#555' metalness={0.7} /></mesh>
              {Array.from({length: 6}, (_, i) => {const a = (i/6)*Math.PI*2; return (
                <mesh key={i} castShadow position={[Math.cos(a)*0.35, 0.5, Math.sin(a)*0.35]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.12, 6]} /><meshStandardMaterial color={i === 0 ? '#ef4444' : '#333'} /></mesh>)})}
            </group>
            {nearSpace?.id === 'wheelofdeath' && <Sparkles count={60} size={6} position={[0, 1, -40]} scale={[3, 2, 3]} speed={5} color='#ef4444' />}
          </Suspense>

          <Floor onClick={(e: any) => {
            if (e.point) clickTargetRef.current = { x: e.point.x, z: e.point.z }
          }} />

          {VISIBLE_BLOCKS.map(([x, y, z, w, h, d], i) => {
            const colors = ['#e74c3c', '#e67e22', '#9b59b6', '#27ae60', '#3498db', '#2980b9', '#1abc9c']
            return <SimpleBox key={i} position={[x, y, z]} args={[w, h, d]} color={colors[i % colors.length]} />
          })}

          {/* 나무 - 도로변 + 공원 전체 */}
          {[
            [25,0,10],[-25,0,10],[0,0,30],[-15,0,-25],[10,0,-30],
            [35,0,-20],[-35,0,-30],[20,0,25],[-30,0,25],[40,0,15],
            [-10,0,-40],[30,0,-35],[-40,0,0],[0,0,40],[42,0,-5],
            // 도로변 가로수
            [4,0,12],[4,0,24],[4,0,36],[-4,0,-12],[-4,0,-24],[-4,0,-36],
            [12,0,4],[24,0,4],[36,0,4],[-12,0,-4],[-24,0,-4],[-36,0,-4],
            // 코너 숲
            [42,0,38],[38,0,42],[44,0,35],[-42,0,38],[-38,0,42],
            [-42,0,-38],[-38,0,-42],[42,0,-38],[38,0,-42],
            [45,0,25],[-45,0,25],[45,0,-25],[-45,0,-25],
          ].map(([x,y,z], i) => <SimpleTree key={`t${i}`} position={[x,y,z] as [number,number,number]} />)}

          {/* 도로 (십자형, 벽 끝까지) */}
          <Road position={[0, 0, 0]} length={100} />
          <Road position={[0, 0, 0]} length={100} horizontal />
          {/* 외곽 순환 도로 */}
          <Road position={[0, 0, 40]} length={100} horizontal />
          <Road position={[0, 0, -40]} length={100} horizontal />
          <Road position={[40, 0, 0]} length={100} />
          <Road position={[-40, 0, 0]} length={100} />

          {/* 중앙 분수 */}
          <Fountain position={[0, 0, 0]} />

          {/* 가로등 (도로 전체 균등 배치) */}
          {[-44,-32,-20,-8,8,20,32,44].map((v, i) => (
            <React.Fragment key={`lamp-${i}`}>
              <Lamp position={[2, 0, v]} />
              <Lamp position={[v, 0, 2]} />
            </React.Fragment>
          ))}

          {/* 벤치 (도로변) */}
          {[8,-8,20,-20,32,-32].map((v, i) => (
            <React.Fragment key={`bench-${i}`}>
              <Bench position={[4, 0, v]} rotation={Math.PI / 2} />
              <Bench position={[v, 0, 4]} rotation={0} />
            </React.Fragment>
          ))}

          {/* 화단 */}
          {[
            [3,0,3],[-3,0,-3],[12,0,8],[-12,0,-8],
            [20,0,12],[-20,0,-12],[12,0,20],[-12,0,-20],
            [30,0,8],[-30,0,8],[8,0,-30],[-8,0,30],
          ].map(([x,y,z], i) => <FlowerBed key={`fb${i}`} position={[x,y,z] as [number,number,number]} />)}

          {/* 동상/조형물 (교차로) */}
          {[[20,0,20],[-20,0,20],[20,0,-20],[-20,0,-20]].map(([x,y,z], i) => (
            <group key={`statue-${i}`} position={[x,y,z] as [number,number,number]}>
              <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.6, 0.7, 0.6, 8]} />
                <meshStandardMaterial color='#888' roughness={0.4} />
              </mesh>
              <mesh castShadow position={[0, 1.2, 0]}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color={['#e74c3c','#3498db','#2ecc71','#f39c12'][i]} metalness={0.3} />
              </mesh>
              <mesh castShadow position={[0, 2, 0]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color='#ffd700' metalness={0.6} />
              </mesh>
            </group>
          ))}

          {/* 아치 게이트 (도로 입구) */}
          {[[0,0,45],[0,0,-45],[45,0,0],[-45,0,0]].map(([x,y,z], i) => (
            <group key={`arch-${i}`} position={[x,y,z] as [number,number,number]} rotation={[0, i >= 2 ? Math.PI/2 : 0, 0]}>
              <mesh castShadow position={[-1.2, 1.5, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 3, 6]} />
                <meshStandardMaterial color='#8B6914' metalness={0.4} />
              </mesh>
              <mesh castShadow position={[1.2, 1.5, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 3, 6]} />
                <meshStandardMaterial color='#8B6914' metalness={0.4} />
              </mesh>
              <mesh castShadow position={[0, 3.1, 0]}>
                <boxGeometry args={[2.8, 0.3, 0.3]} />
                <meshStandardMaterial color='#c9a84c' metalness={0.5} />
              </mesh>
            </group>
          ))}

          {/* 높은 전망대 (비행으로 올라감) */}
          <group position={[30, 0, 30]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} castShadow position={[i < 2 ? -2 : 2, 1.5, i % 2 === 0 ? -2 : 2]}>
                <cylinderGeometry args={[0.15, 0.2, 3, 6]} />
                <meshStandardMaterial color='#8B6914' metalness={0.4} />
              </mesh>
            ))}
            <mesh castShadow receiveShadow position={[0, 3, 0]}>
              <boxGeometry args={[5, 0.3, 5]} />
              <meshStandardMaterial color='#5a4a3a' />
            </mesh>
            <mesh position={[0, 3.2, 0]}>
              <boxGeometry args={[4.5, 0.05, 4.5]} />
              <meshStandardMaterial color='#c9a84c' metalness={0.3} />
            </mesh>
          </group>

          <group position={[-30, 0, -30]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} castShadow position={[i < 2 ? -2 : 2, 1.5, i % 2 === 0 ? -2 : 2]}>
                <cylinderGeometry args={[0.15, 0.2, 3, 6]} />
                <meshStandardMaterial color='#8B6914' metalness={0.4} />
              </mesh>
            ))}
            <mesh castShadow receiveShadow position={[0, 3, 0]}>
              <boxGeometry args={[5, 0.3, 5]} />
              <meshStandardMaterial color='#5a4a3a' />
            </mesh>
          </group>

          {/* 중간 플랫폼 */}
          <group position={[35, 0, -10]}>
            <mesh castShadow position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 1.5, 6]} />
              <meshStandardMaterial color='#666' metalness={0.5} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
              <boxGeometry args={[3, 0.3, 3]} />
              <meshStandardMaterial color='#4a4a5a' />
            </mesh>
          </group>
          <group position={[-35, 0, 10]}>
            <mesh castShadow position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 1.5, 6]} />
              <meshStandardMaterial color='#666' metalness={0.5} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
              <boxGeometry args={[3, 0.3, 3]} />
              <meshStandardMaterial color='#4a4a5a' />
            </mesh>
          </group>

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
          <div className='fixed left-1/2 bottom-[100px] -translate-x-1/2 z-[200]'>
            <button onClick={enterGame}
              className='glass-dark flex flex-col items-center gap-[6px] px-[24px] py-[12px] cursor-pointer transition-all hover:scale-105 hover:bg-white/10'>
              <span className='text-[14px] font-bold' style={{ color: '#fff' }}>{nearSpace.name}</span>
              <div className='flex items-center gap-[6px]'>
                <span className='text-[11px] font-bold w-[22px] h-[22px] rounded-[5px] flex items-center justify-center'
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>E</span>
                <span className='text-[10px]' style={{ color: '#888' }}>클릭 또는 E키</span>
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
