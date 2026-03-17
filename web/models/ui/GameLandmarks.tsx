import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 룰렛 테이블: 원형 테이블 + 회전하는 룰렛 휠
export const RouletteTable = (props: any) => {
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame((_, delta) => { if (wheelRef.current) wheelRef.current.rotation.y += delta * 0.5 })

  return (
    <group {...props}>
      {/* 테이블 다리 4개 */}
      {[[-0.6, 0, -0.6], [0.6, 0, -0.6], [-0.6, 0, 0.6], [0.6, 0, 0.6]].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, 0.4, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
          <meshStandardMaterial color='#5d3a1a' />
        </mesh>
      ))}
      {/* 테이블 상판 */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 24]} />
        <meshStandardMaterial color='#1a6e1a' />
      </mesh>
      {/* 룰렛 휠 (회전) */}
      <group ref={wheelRef} position={[0, 0.95, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 20]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        {/* 휠 위 숫자 표시용 색 조각들 */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} castShadow position={[Math.cos(angle) * 0.4, 0.06, Math.sin(angle) * 0.4]}>
              <boxGeometry args={[0.12, 0.04, 0.12]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#c0392b' : '#1a1a1a'} />
            </mesh>
          )
        })}
        {/* 중앙 */}
        <mesh castShadow position={[0, 0.06, 0]}>
          <coneGeometry args={[0.1, 0.15, 8]} />
          <meshStandardMaterial color='#c9a84c' />
        </mesh>
      </group>
      {/* 간판 */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 0.05]} />
        <meshStandardMaterial color='#1a3a1a' emissive='#0a2a0a' emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// 슬롯머신: 아케이드 캐비넷
export const SlotCabinet = (props: any) => {
  const leverRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (leverRef.current) leverRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.2
  })

  return (
    <group {...props}>
      {/* 본체 */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[1.4, 2.2, 1]} />
        <meshStandardMaterial color='#6a1b9a' />
      </mesh>
      {/* 화면 */}
      <mesh position={[0, 1.5, 0.51]}>
        <boxGeometry args={[1, 0.8, 0.02]} />
        <meshStandardMaterial color='#111' emissive='#3a1060' emissiveIntensity={0.5} />
      </mesh>
      {/* 상단 장식 */}
      <mesh castShadow position={[0, 2.35, 0]}>
        <boxGeometry args={[1.5, 0.3, 1.1]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.5} roughness={0.3} />
      </mesh>
      {/* 레버 */}
      <group position={[0.85, 1.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color='#888' metalness={0.8} />
        </mesh>
        <mesh ref={leverRef} castShadow position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color='#e74c3c' />
        </mesh>
      </group>
      {/* 코인 투입구 */}
      <mesh position={[0, 0.5, 0.51]}>
        <boxGeometry args={[0.3, 0.05, 0.02]} />
        <meshStandardMaterial color='#333' />
      </mesh>
    </group>
  )
}

// 지뢰찾기: 보석이 박힌 돌
export const MineRock = (props: any) => {
  const gemRef = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (gemRef.current) {
      gemRef.current.rotation.y = state.clock.elapsedTime * 0.8
      gemRef.current.position.y = 1.6 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group {...props}>
      {/* 바위 */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color='#4a4a5a' roughness={0.9} />
      </mesh>
      {/* 떠다니는 보석 */}
      <group ref={gemRef}>
        <mesh castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color='#3498db' emissive='#1a5276' emissiveIntensity={0.8} metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
      {/* 바위에 박힌 작은 보석들 */}
      {[[0.5, 0.7, 0.3], [-0.4, 0.3, 0.5], [0.3, 0.4, -0.5]].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color={['#2ecc71', '#e74c3c', '#f39c12'][i]} emissive={['#1a6b3a', '#8b1a1a', '#8b6914'][i]} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// 크래시: 로켓 발사대
export const RocketPad = (props: any) => {
  const rocketRef = useRef<THREE.Group>(null!)
  const flameRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3
    }
  })

  return (
    <group {...props}>
      {/* 발사대 */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.3, 8]} />
        <meshStandardMaterial color='#333' metalness={0.5} />
      </mesh>
      {/* 발사대 링 */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <torusGeometry args={[0.7, 0.06, 8, 16]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.7} />
      </mesh>
      {/* 로켓 */}
      <group ref={rocketRef}>
        <mesh castShadow>
          <coneGeometry args={[0.25, 0.8, 8]} />
          <meshStandardMaterial color='#e74c3c' />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.4, 8]} />
          <meshStandardMaterial color='#c0392b' />
        </mesh>
        {/* 날개 */}
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <mesh key={i} castShadow position={[Math.cos(angle) * 0.25, -0.6, Math.sin(angle) * 0.25]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.02, 0.3, 0.2]} />
            <meshStandardMaterial color='#e67e22' />
          </mesh>
        ))}
        {/* 불꽃 */}
        <mesh ref={flameRef} position={[0, -0.8, 0]}>
          <coneGeometry args={[0.15, 0.4, 6]} />
          <meshStandardMaterial color='#f39c12' emissive='#e74c3c' emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// 하이로: 카드 테이블
export const CardTable = (props: any) => {
  const cardRef = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (cardRef.current) cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3
  })

  return (
    <group {...props}>
      {/* 테이블 */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1, 1, 0.08, 16]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      {/* 떠다니는 카드 */}
      <group ref={cardRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.7, 0.02]} />
          <meshStandardMaterial color='#fff' />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[0.35, 0.5, 0.005]} />
          <meshStandardMaterial color='#e74c3c' />
        </mesh>
      </group>
    </group>
  )
}

// 코인 플립: 거대 동전
export const GiantCoin = (props: any) => {
  const coinRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y = state.clock.elapsedTime * 1.2
      coinRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <group {...props}>
      {/* 받침대 */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 8]} />
        <meshStandardMaterial color='#8B6914' metalness={0.5} />
      </mesh>
      {/* 회전 동전 */}
      <mesh ref={coinRef} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 24]} />
        <meshStandardMaterial color='#ffd700' metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// 주사위: 거대 주사위
export const GiantDice = (props: any) => {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.7) * 0.2
      ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 8]} />
        <meshStandardMaterial color='#2d5a27' />
      </mesh>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color='#fff' />
      </mesh>
    </group>
  )
}

// 행운의 바퀴
export const WheelStand = (props: any) => {
  const wheelRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (wheelRef.current) wheelRef.current.rotation.z = state.clock.elapsedTime * 0.3
  })
  return (
    <group {...props}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 3, 6]} />
        <meshStandardMaterial color='#8B6914' metalness={0.5} />
      </mesh>
      <mesh ref={wheelRef} castShadow position={[0, 2.5, 0.15]}>
        <torusGeometry args={[0.8, 0.08, 8, 16]} />
        <meshStandardMaterial color='#e91e63' metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 2.5, 0.15]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshStandardMaterial color='#ffd700' metalness={0.7} />
      </mesh>
    </group>
  )
}

// Plinko: 피라미드 구조
export const PlinkoBoard = (props: any) => {
  const ballRef = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (ballRef.current) {
      ballRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 3) * 0.3
      ballRef.current.position.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.3
    }
  })
  return (
    <group {...props}>
      {/* 보드 (삼각형 프리즘) */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.8, 2.2, 0.15]} />
        <meshStandardMaterial color='#0a1a3a' />
      </mesh>
      {/* 금색 프레임 */}
      <mesh castShadow position={[0, 2.4, 0]}>
        <boxGeometry args={[2, 0.15, 0.2]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.5} />
      </mesh>
      {/* 핀들 */}
      {Array.from({length: 5}, (_, row) =>
        Array.from({length: row + 2}, (_, col) => (
          <mesh key={`${row}-${col}`} castShadow
            position={[-0.5 + col * (1/(row+2)), 0.5 + row * 0.35, 0.1]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color='#c9a84c' />
          </mesh>
        ))
      )}
      {/* 떨어지는 공 */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#e74c3c' emissive='#e74c3c' emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Blackjack: 카드 테이블
export const BlackjackTable = (props: any) => {
  const cardsRef = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (cardsRef.current) cardsRef.current.rotation.y = state.clock.elapsedTime * 0.2
  })
  return (
    <group {...props}>
      {/* 반원 테이블 */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.4, 8]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      {/* 회전 카드 */}
      <group ref={cardsRef} position={[0, 0.8, 0]}>
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={i} castShadow position={[x, 0.3 + i * 0.05, 0]} rotation={[0, i * 0.3, 0]}>
            <boxGeometry args={[0.3, 0.42, 0.01]} />
            <meshStandardMaterial color={i === 1 ? '#e74c3c' : '#fff'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// 바카라: 카드 테이블 (반원)
export const BaccaratTable = (props: any) => {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.08, 16]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 8]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.4]} />
        <meshStandardMaterial color='#fff' />
      </mesh>
    </group>
  )
}

// 가위바위보: 3개 손 모형
export const RPSStand = (props: any) => {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5 })
  return (
    <group {...props}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.3, 8]} />
        <meshStandardMaterial color='#8B6914' metalness={0.3} />
      </mesh>
      <group ref={ref} position={[0, 0.8, 0]}>
        {[0, 2.1, 4.2].map((angle, i) => (
          <mesh key={i} castShadow position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71'][i]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// 경마: 말 + 트랙
export const RaceTrack = (props: any) => {
  const horseRef = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (horseRef.current) {
      horseRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.8
      horseRef.current.position.z = Math.cos(state.clock.elapsedTime * 2) * 0.8
      horseRef.current.rotation.y = state.clock.elapsedTime * 2 + Math.PI / 2
    }
  })
  return (
    <group {...props}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.6, 1.2, 16]} />
        <meshStandardMaterial color='#8B6914' />
      </mesh>
      <group ref={horseRef}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.15]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        <mesh castShadow position={[0.2, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
      </group>
    </group>
  )
}
