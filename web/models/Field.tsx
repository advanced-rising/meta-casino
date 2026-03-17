import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { Sky, Loader, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Lights, { getDayProgress } from '@/models/ui/Lights'
import Character, { OtherCharacter, CharacterInput } from '@/models/Character'
import MobileControls, { MobileInput } from '@/components/dom/MobileControls'
import { useRouter } from 'next/router'
import { GAME_SPACES } from '@/utils/mapData'

const MAP_SIZE = 50

// 건물 컴포넌트
const Building = ({ position, width, depth, height, color, emissive, name, rotation = 0 }: {
  position: [number, number, number]; width: number; depth: number; height: number
  color: string; emissive?: string; name?: string; rotation?: number
}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* 건물 본체 */}
    <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* 창문 (앞면) */}
    {Array.from({ length: Math.floor(height / 2) }, (_, floor) =>
      Array.from({ length: Math.max(1, Math.floor(width / 1.5)) }, (_, col) => (
        <mesh key={`${floor}-${col}`} position={[
          -width / 2 + 0.8 + col * 1.4,
          1.5 + floor * 2,
          depth / 2 + 0.01,
        ]}>
          <boxGeometry args={[0.6, 0.8, 0.01]} />
          <meshStandardMaterial
            color={emissive || '#ffd700'}
            emissive={emissive || '#ffd700'}
            emissiveIntensity={Math.random() > 0.3 ? 0.4 : 0}
          />
        </mesh>
      ))
    )}
    {/* 입구 */}
    <mesh position={[0, 0.8, depth / 2 + 0.01]}>
      <boxGeometry args={[1.2, 1.6, 0.01]} />
      <meshStandardMaterial color='#111' />
    </mesh>
    {/* 네온 간판 (건물 상단 앞면) */}
    <mesh position={[0, height - 0.8, depth / 2 + 0.05]}>
      <boxGeometry args={[width * 0.8, 0.6, 0.05]} />
      <meshStandardMaterial color={emissive || '#fff'} emissive={emissive || '#fff'} emissiveIntensity={1.5} />
    </mesh>
    {/* 입구 위 조명 */}
    <mesh position={[0, 1.8, depth / 2 + 0.03]}>
      <boxGeometry args={[1.5, 0.15, 0.03]} />
      <meshStandardMaterial color={emissive || '#fff'} emissive={emissive || '#fff'} emissiveIntensity={1} />
    </mesh>
  </group>
)

// 바닥
const Floor = ({ onClick, groundColor }: { onClick?: (e: any) => void; groundColor: string }) => (
  <group>
    {/* 맵 밖 배경 (매우 넓게) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color={groundColor} />
    </mesh>
    {/* 맵 영역 바닥 */}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} onClick={onClick}>
      <planeGeometry args={[MAP_SIZE * 2, MAP_SIZE * 2]} />
      <meshStandardMaterial color='#2a2a2a' />
    </mesh>
    {/* 도로 (십자 + 외곽) */}
    {[
      [0, 0.01, 0, 100, 6, false],   // 메인 세로
      [0, 0.01, 0, 100, 6, true],    // 메인 가로
    ].map(([x, y, z, len, w, horiz], i) => (
      <group key={i}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, horiz ? Math.PI / 2 : 0]} position={[x as number, y as number, z as number]}>
          <planeGeometry args={[w as number, len as number]} />
          <meshStandardMaterial color='#1a1a1a' />
        </mesh>
        {/* 중앙선 */}
        <mesh rotation={[-Math.PI / 2, 0, horiz ? Math.PI / 2 : 0]} position={[x as number, 0.02, z as number]}>
          <planeGeometry args={[0.15, len as number]} />
          <meshStandardMaterial color='#eab308' />
        </mesh>
      </group>
    ))}
    {/* 인도 (도로 양쪽) */}
    {[-3.5, 3.5].map((offset, i) => (
      <React.Fragment key={`sidewalk-${i}`}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.02, 0]}>
          <planeGeometry args={[1, 100]} />
          <meshStandardMaterial color='#333' />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, offset]}>
          <planeGeometry args={[1, 100]} />
          <meshStandardMaterial color='#333' />
        </mesh>
      </React.Fragment>
    ))}
  </group>
)

// 가로등
const StreetLight = ({ position, isNight }: { position: [number, number, number]; isNight: boolean }) => (
  <group position={position}>
    <mesh castShadow position={[0, 2, 0]}>
      <cylinderGeometry args={[0.04, 0.05, 4, 6]} />
      <meshStandardMaterial color='#666' metalness={0.6} />
    </mesh>
    <mesh position={[0, 4.1, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial
        color={isNight ? '#fff5d0' : '#ddd'}
        emissive={isNight ? '#ffd700' : '#888'}
        emissiveIntensity={isNight ? 2 : 0.2}
      />
    </mesh>
    {isNight && <pointLight position={[0, 3.8, 0]} intensity={2} distance={12} color='#ffeaa7' decay={2} />}
  </group>
)

const Field = ({
  enteredInput, socket, clients, nickname,
}: { enteredInput: boolean; socket: any; clients: any; nickname: string }) => {
  const router = useRouter()
  const [isSet, setIsSet] = useState(false)
  const [nearSpace, setNearSpace] = useState<{ id: string; name: string; route: string } | null>(null)
  const nearSpaceRef = useRef<{ id: string; name: string; route: string } | null>(null)
  const charInputRef = useRef<CharacterInput | null>(null)
  const mobileInputRef = useRef<MobileInput>({ dx: 0, dy: 0, magnitude: 0, active: false })
  const clickTargetRef = useRef<{ x: number; z: number } | null>(null)

  const [isNight, setIsNight] = useState(false)
  const [sunPos, setSunPos] = useState<[number, number, number]>([100, 50, 100])
  const [bgColor, setBgColor] = useState('#87ceeb')

  useEffect(() => {
    if (typeof window !== 'undefined') setIsSet(true)
    const checkTime = () => {
      const d = getDayProgress()
      setIsNight(!d.isDay)
      setSunPos(d.sunPosition)
      setBgColor(d.bgColor)
    }
    checkTime()
    const timer = setInterval(checkTime, 10000) // 10초마다 체크
    return () => clearInterval(timer)
  }, [])

  const handleNearSpace = useCallback((space: any) => {
    nearSpaceRef.current = space
    setNearSpace(prev => prev?.id === space?.id ? prev : space)
  }, [])

  const enterGame = useCallback(() => {
    if (!nearSpaceRef.current) return
    router.push(nearSpaceRef.current.route)
  }, [router])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'KeyE' && nearSpaceRef.current) enterGame() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [router, enterGame])

  const handleMobileJump = useCallback(() => {
    if (charInputRef.current) { charInputRef.current.jump = true; setTimeout(() => { if (charInputRef.current) charInputRef.current.jump = false }, 200) }
  }, [])
  const handleMobileInteract = useCallback(() => { if (nearSpaceRef.current) router.push(nearSpaceRef.current.route) }, [router])

  // 건물: [id, x, z, w, d, h, color, emissive, rotation]
  // rotation: 건물 앞면이 가장 가까운 도로를 바라보도록
  // x도로(z=0) 옆: x>0이면 rot=PI (남향), x<0이면 rot=0 (북향)
  // z도로(x=0) 옆: z>0이면 rot=PI/2 (서향), z<0이면 rot=-PI/2 (동향)
  const P = Math.PI
  const BUILDINGS: [string, number, number, number, number, number, string, string, number][] = [
    // z도로(x=0) 오른쪽 건물들 → 도로를 바라봄 (rot=PI, 서쪽을 봄 = 도로 방향)
    ['roulette', 12, 8, 5, 4, 8, '#1a3a1a', '#22c55e', -P/2],
    ['hilo', 18, -10, 4, 4, 7, '#0a3a0a', '#22c55e', -P/2],
    ['coinflip', 12, 20, 4, 4, 5, '#2a1a00', '#eab308', -P/2],
    // z도로(x=0) 왼쪽 건물들 → 도로를 바라봄
    ['slot', -12, 15, 5, 4, 10, '#2a1040', '#a855f7', P/2],
    ['crash', -15, -15, 5, 4, 12, '#2a0a0a', '#ef4444', P/2],
    // x도로(z=0) 위쪽 건물들 → 도로를 바라봄
    ['mines', 8, -18, 4, 4, 6, '#0a2540', '#3b82f6', 0],
    ['baccarat', 8, 28, 5, 4, 6, '#0a2a0a', '#c9a84c', P],
    // 외곽 (가장 가까운 도로 방향)
    ['dice', -18, 22, 4, 4, 6, '#1a2a0a', '#22c55e', P/2],
    ['wheel', 22, 22, 5, 4, 9, '#2a0a2a', '#e91e63', -P/2],
    ['plinko', 28, -22, 5, 4, 8, '#0a1a3a', '#f59e0b', 0],
    ['blackjack', -28, 8, 6, 4, 7, '#0a3a0a', '#22c55e', P/2],
    ['rps', -22, -22, 4, 4, 5, '#2a1a00', '#f59e0b', P/2],
    ['horserace', 22, -28, 6, 4, 5, '#1a2a0a', '#22c55e', 0],
    ['tower', 35, 12, 4, 4, 14, '#1a1a2e', '#a855f7', -P/2],
    ['scratch', -35, -12, 4, 4, 5, '#2a1a00', '#f59e0b', P/2],
    ['limbo', 12, 35, 4, 4, 7, '#0a0a2a', '#3b82f6', P],
    ['colorpredict', -12, -35, 4, 4, 6, '#1a0a1a', '#e91e63', 0],
    ['bombdefuse', 35, 35, 5, 4, 8, '#2a0a0a', '#ef4444', P],
    ['keno', -35, 28, 4, 4, 6, '#0a1a3a', '#3b82f6', P],
    ['war', 38, -28, 5, 4, 7, '#1a0a0a', '#ef4444', 0],
    ['numberguess', -38, -18, 4, 4, 8, '#0c0812', '#a855f7', P/2],
    ['wheelofdeath', 8, -38, 5, 4, 6, '#1a0808', '#ef4444', 0],
  ]

  return (
    isSet && clients && socket && (
      <>
        <Canvas shadows camera={{ zoom: 60, position: [10, 10, 10], near: -1000, far: 1000 }} orthographic style={{ background: bgColor }}>
          <Lights />
          <Suspense fallback={null}>
            {/* 다른 플레이어 */}
            {Object.keys(clients).filter(k => k !== socket.id).map(id => {
              const c = clients[id]; if (!c) return null
              return <OtherCharacter key={id} position={c.position || [0,0,0]} rotation={c.rotation || [0,0,0,1]} nickname={c.nickname || ''} />
            })}

            {/* 내 캐릭터 */}
            <Character enteredInput={enteredInput} socket={socket} nickname={nickname}
              onNearSpace={handleNearSpace} inputRef={charInputRef} mobileInputRef={mobileInputRef} clickTarget={clickTargetRef} />

            {/* 건물 + 스파클 */}
            {BUILDINGS.map(([id, x, z, w, d, h, color, emissive, rot]) => {
              const space = GAME_SPACES.find(s => s.id === id)
              return (
                <React.Fragment key={id}>
                  <Building position={[x, 0, z]} width={w} depth={d} height={h} color={color} emissive={emissive} name={space?.name} rotation={rot} />
                  {nearSpace?.id === id && (
                    <Sparkles count={40} size={4} position={[x, h / 2, z]} scale={[w + 1, h, d + 1]} speed={3} color={emissive} />
                  )}
                </React.Fragment>
              )
            })}
          </Suspense>

          <Floor groundColor={isNight ? '#151525' : '#3a5a2a'} onClick={(e: any) => { if (e.point) clickTargetRef.current = { x: e.point.x, z: e.point.z } }} />

          {/* 가로등 (도로변) */}
          {[-44, -36, -28, -20, -12, -4, 8, 16, 24, 32, 40].map((v, i) => (
            <React.Fragment key={`sl-${i}`}>
              <StreetLight position={[4.5, 0, v]} isNight={isNight} />
              <StreetLight position={[-4.5, 0, v]} isNight={isNight} />
              <StreetLight position={[v, 0, 4.5]} isNight={isNight} />
              <StreetLight position={[v, 0, -4.5]} isNight={isNight} />
            </React.Fragment>
          ))}

          {/* 경계 벽 */}
          {[
            [MAP_SIZE, 3, 0, 0.5, 6, MAP_SIZE * 2],
            [-MAP_SIZE, 3, 0, 0.5, 6, MAP_SIZE * 2],
            [0, 3, MAP_SIZE, MAP_SIZE * 2, 6, 0.5],
            [0, 3, -MAP_SIZE, MAP_SIZE * 2, 6, 0.5],
          ].map(([x, y, z, w, h, d], i) => (
            <mesh key={`wall-${i}`} castShadow position={[x, y, z] as [number, number, number]}>
              <boxGeometry args={[w, h, d] as [number, number, number]} />
              <meshStandardMaterial color='#1a1a1a' />
            </mesh>
          ))}

          <Sky sunPosition={sunPos} />
        </Canvas>

        {/* 게임장 입장 UI */}
        {nearSpace && (
          <div className='fixed left-1/2 bottom-[70px] -translate-x-1/2 z-[200]'>
            <button onClick={enterGame}
              className='glass-dark flex flex-col items-center gap-[4px] px-[24px] py-[10px] cursor-pointer transition-all hover:scale-105 hover:bg-white/10'>
              <span className='text-[14px] font-bold' style={{ color: '#fff' }}>{nearSpace.name}</span>
              <div className='flex items-center gap-[6px]'>
                <span className='text-[11px] font-bold w-[22px] h-[22px] rounded-[5px] flex items-center justify-center'
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>E</span>
                <span className='text-[10px]' style={{ color: '#888' }}>클릭 또는 E키</span>
              </div>
            </button>
          </div>
        )}

        <MobileControls mobileInputRef={mobileInputRef} onJump={handleMobileJump} onInteract={handleMobileInteract} />
        <Loader
          containerStyles={{ background: '#0a0a0a' }}
          barStyles={{ background: '#22c55e' }}
          dataStyles={{ color: '#fff', fontSize: '12px' }}
          dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
          initialState={(active) => active}
        />
      </>
    )
  )
}

export default Field
