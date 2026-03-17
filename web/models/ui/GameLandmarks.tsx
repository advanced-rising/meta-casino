import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============ 룰렛: 녹색 테이블 + 회전 휠 + 골드 볼 ============
export const RouletteTable = (props: any) => {
  const wheelRef = useRef<THREE.Group>(null!)
  const ballRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (wheelRef.current) wheelRef.current.rotation.y += 0.02
    if (ballRef.current) {
      const t = s.clock.elapsedTime * 2
      ballRef.current.position.x = Math.cos(t) * 0.45
      ballRef.current.position.z = Math.sin(t) * 0.45
    }
  })
  return (
    <group {...props}>
      {/* 테이블 */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.12, 24]} />
        <meshStandardMaterial color='#0d6b0d' />
      </mesh>
      {/* 4 다리 */}
      {[[0.8,0,0.8],[-0.8,0,0.8],[0.8,0,-0.8],[-0.8,0,-0.8]].map(([x,,z], i) => (
        <mesh key={i} castShadow position={[x, 0.22, z]}>
          <cylinderGeometry args={[0.06, 0.08, 0.44, 6]} />
          <meshStandardMaterial color='#5d3a1a' />
        </mesh>
      ))}
      {/* 휠 */}
      <group ref={wheelRef} position={[0, 0.62, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
          <meshStandardMaterial color='#4a2a0a' />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.4, 0.05, Math.sin(a) * 0.4]}>
              <boxGeometry args={[0.08, 0.03, 0.08]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#c0392b' : '#111'} />
            </mesh>
          )
        })}
        <mesh ref={ballRef} position={[0.45, 0.08, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='#ffd700' metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* 중앙 콘 */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.6} />
      </mesh>
    </group>
  )
}

// ============ 슬롯머신: 보라색 아케이드 캐비넷 + 레버 ============
export const SlotCabinet = (props: any) => {
  const leverRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => { if (leverRef.current) leverRef.current.rotation.x = Math.sin(s.clock.elapsedTime * 2) * 0.3 })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshStandardMaterial color='#5b1a8a' />
      </mesh>
      {/* 화면 */}
      <mesh position={[0, 1.3, 0.42]}>
        <boxGeometry args={[0.9, 0.6, 0.02]} />
        <meshStandardMaterial color='#111' emissive='#3a1060' emissiveIntensity={0.4} />
      </mesh>
      {/* 릴 표시 3칸 */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.3, 0.44]}>
          <boxGeometry args={[0.22, 0.4, 0.01]} />
          <meshStandardMaterial color={['#e74c3c', '#2ecc71', '#3498db'][i]} emissive={['#e74c3c', '#2ecc71', '#3498db'][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* 상단 "777" */}
      <mesh castShadow position={[0, 2.15, 0]}>
        <boxGeometry args={[1.3, 0.25, 0.85]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.5} />
      </mesh>
      {/* 레버 */}
      <group position={[0.75, 1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
          <meshStandardMaterial color='#888' metalness={0.7} />
        </mesh>
        <mesh ref={leverRef} castShadow position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color='#e74c3c' />
        </mesh>
      </group>
    </group>
  )
}

// ============ 마인즈: 바위 위 떠다니는 다이아몬드 ============
export const MineRock = (props: any) => {
  const gemRef = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (gemRef.current) {
      gemRef.current.rotation.y = s.clock.elapsedTime
      gemRef.current.position.y = 1.8 + Math.sin(s.clock.elapsedTime * 2) * 0.15
    }
  })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color='#555' roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.5, 0.3, 0.3]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color='#444' roughness={0.9} />
      </mesh>
      {/* 떠다니는 다이아몬드 */}
      <group ref={gemRef}>
        <mesh castShadow>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color='#00d4ff' emissive='#0066aa' emissiveIntensity={1} metalness={0.7} roughness={0.1} />
        </mesh>
      </group>
      {/* 바위에 박힌 작은 보석 */}
      {[[0.4, 0.6, 0.4, '#e74c3c'], [-0.3, 0.3, 0.5, '#2ecc71'], [0.2, 0.2, -0.4, '#f39c12']].map(([x, y, z, c], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ============ 크래시: 로켓 발사대 + 불꽃 ============
export const RocketPad = (props: any) => {
  const rocketRef = useRef<THREE.Group>(null!)
  const flameRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (rocketRef.current) rocketRef.current.position.y = 1.5 + Math.sin(s.clock.elapsedTime * 1.5) * 0.2
    if (flameRef.current) flameRef.current.scale.y = 0.5 + Math.sin(s.clock.elapsedTime * 8) * 0.4
  })
  return (
    <group {...props}>
      {/* 발사대 */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.2, 8]} />
        <meshStandardMaterial color='#333' metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.7, 0.04, 6, 16]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.7} />
      </mesh>
      {/* 로켓 */}
      <group ref={rocketRef}>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.6, 8]} />
          <meshStandardMaterial color='#e74c3c' />
        </mesh>
        <mesh castShadow position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.3, 8]} />
          <meshStandardMaterial color='#bbb' metalness={0.6} />
        </mesh>
        {/* 날개 3개 */}
        {[0, 2.09, 4.19].map((a, i) => (
          <mesh key={i} castShadow position={[Math.cos(a) * 0.2, -0.5, Math.sin(a) * 0.2]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.02, 0.25, 0.15]} />
            <meshStandardMaterial color='#e67e22' />
          </mesh>
        ))}
        {/* 불꽃 */}
        <mesh ref={flameRef} position={[0, -0.65, 0]}>
          <coneGeometry args={[0.12, 0.35, 6]} />
          <meshStandardMaterial color='#f39c12' emissive='#e74c3c' emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// ============ 하이로: 카드 테이블 + 떠다니는 카드 ============
export const CardTable = (props: any) => {
  const cardRef = useRef<THREE.Group>(null!)
  useFrame((s) => { if (cardRef.current) cardRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.5 })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.06, 16]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 6]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      {/* 떠다니는 카드 2장 */}
      <group ref={cardRef} position={[0, 1, 0]}>
        <mesh castShadow position={[-0.15, 0, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.35, 0.5, 0.01]} />
          <meshStandardMaterial color='#fff' />
        </mesh>
        <mesh castShadow position={[0.15, 0.05, 0.02]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.35, 0.5, 0.01]} />
          <meshStandardMaterial color='#1a3a8a' />
        </mesh>
        {/* ↑↓ 화살표 */}
        <mesh position={[0, 0.35, 0.02]}>
          <coneGeometry args={[0.08, 0.15, 4]} />
          <meshStandardMaterial color='#2ecc71' emissive='#2ecc71' emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.35, 0.02]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.08, 0.15, 4]} />
          <meshStandardMaterial color='#e74c3c' emissive='#e74c3c' emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ============ 코인플립: 회전하는 금화 ============
export const GiantCoin = (props: any) => {
  const coinRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (coinRef.current) {
      coinRef.current.rotation.y = s.clock.elapsedTime * 1.5
      coinRef.current.position.y = 1 + Math.sin(s.clock.elapsedTime * 2) * 0.1
    }
  })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
        <meshStandardMaterial color='#8B6914' metalness={0.5} />
      </mesh>
      <mesh ref={coinRef} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 24]} />
        <meshStandardMaterial color='#ffd700' metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  )
}

// ============ 다이스: 2개 주사위 회전 ============
export const GiantDice = (props: any) => {
  const d1 = useRef<THREE.Mesh>(null!)
  const d2 = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (d1.current) { d1.current.rotation.x = s.clock.elapsedTime * 0.3; d1.current.rotation.z = s.clock.elapsedTime * 0.5 }
    if (d2.current) { d2.current.rotation.x = -s.clock.elapsedTime * 0.4; d2.current.rotation.z = s.clock.elapsedTime * 0.3 }
  })
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.2, 8]} />
        <meshStandardMaterial color='#2d5a27' />
      </mesh>
      <mesh ref={d1} castShadow position={[-0.25, 0.7, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color='#fff' />
      </mesh>
      <mesh ref={d2} castShadow position={[0.25, 1, 0.15]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color='#e74c3c' />
      </mesh>
    </group>
  )
}

// ============ 포춘휠: 세로 회전 바퀴 ============
export const WheelStand = (props: any) => {
  const wheelRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => { if (wheelRef.current) wheelRef.current.rotation.z = s.clock.elapsedTime * 0.4 })
  return (
    <group {...props}>
      <mesh castShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.6, 6]} />
        <meshStandardMaterial color='#8B6914' metalness={0.5} />
      </mesh>
      <mesh ref={wheelRef} castShadow position={[0, 2.2, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.06, 6, 16]} />
        <meshStandardMaterial color='#e91e63' />
      </mesh>
      {/* 바퀴 안 색깔 조각 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.35, 2.2, 0.12 + Math.sin(a) * 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#ffd700'][i]} emissive={['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#ffd700'][i]} emissiveIntensity={0.3} />
          </mesh>
        )
      })}
      {/* 포인터 */}
      <mesh position={[0, 2.95, 0.12]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color='#ffd700' />
      </mesh>
    </group>
  )
}

// ============ 플링코: 삼각형 보드 + 낙하 공 ============
export const PlinkoBoard = (props: any) => {
  const ballRef = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (ballRef.current) {
      ballRef.current.position.y = 2.2 + Math.sin(s.clock.elapsedTime * 3) * 0.3
      ballRef.current.position.x = Math.sin(s.clock.elapsedTime * 1.5) * 0.4
    }
  })
  return (
    <group {...props}>
      {/* 삼각형 보드 */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.6, 2, 0.1]} />
        <meshStandardMaterial color='#0a1a3a' />
      </mesh>
      {/* 골드 프레임 */}
      <mesh castShadow position={[0, 2.3, 0]}>
        <boxGeometry args={[1.7, 0.12, 0.15]} />
        <meshStandardMaterial color='#c9a84c' metalness={0.6} />
      </mesh>
      {/* 핀 배열 */}
      {[0, 1, 2, 3].map((row) =>
        Array.from({ length: row + 2 }, (_, col) => (
          <mesh key={`${row}-${col}`} position={[-0.3 + col * (0.6 / (row + 1)), 0.6 + row * 0.35, 0.08]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color='#c9a84c' metalness={0.8} />
          </mesh>
        ))
      )}
      {/* 떨어지는 공 */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color='#e74c3c' emissive='#e74c3c' emissiveIntensity={0.4} />
      </mesh>
      {/* 하단 슬롯 색상 */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0.08]}>
          <boxGeometry args={[0.2, 0.1, 0.02]} />
          <meshStandardMaterial color={['#e74c3c', '#f39c12', '#2ecc71', '#f39c12', '#e74c3c'][i]} emissive={['#e74c3c', '#f39c12', '#2ecc71', '#f39c12', '#e74c3c'][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// ============ 블랙잭: 반원 테이블 + 카드 ============
export const BlackjackTable = (props: any) => {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1, 1, 0.08, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.1, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.4, 6]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      {/* 카드 */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.5, -0.2]} rotation={[-0.3, 0, (i - 1) * 0.15]}>
          <boxGeometry args={[0.25, 0.35, 0.01]} />
          <meshStandardMaterial color={i === 1 ? '#e74c3c' : '#fff'} />
        </mesh>
      ))}
      {/* 칩 */}
      {[[0.4, 0.47, 0.2, '#e74c3c'], [-0.4, 0.47, 0.15, '#3498db'], [0, 0.47, 0.3, '#2ecc71']].map(([x, y, z, c], i) => (
        <mesh key={i} castShadow position={[x as number, y as number, z as number]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
          <meshStandardMaterial color={c as string} />
        </mesh>
      ))}
    </group>
  )
}

// ============ 바카라: 우아한 테이블 + 카드 ============
export const BaccaratTable = (props: any) => {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.08, 1]} />
        <meshStandardMaterial color='#0a5a0a' />
      </mesh>
      <mesh castShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.85, 0.1, 1.05]} />
        <meshStandardMaterial color='#5d3a1a' />
      </mesh>
      {[[-0.7,0,-0.3],[0.7,0,-0.3],[-0.7,0,0.3],[0.7,0,0.3]].map(([x,,z], i) => (
        <mesh key={i} castShadow position={[x, 0.17, z]}>
          <cylinderGeometry args={[0.05, 0.06, 0.34, 6]} />
          <meshStandardMaterial color='#5d3a1a' />
        </mesh>
      ))}
      {/* PLAYER / BANKER 영역 */}
      <mesh position={[-0.4, 0.45, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.5]} />
        <meshStandardMaterial color='#0066aa' transparent opacity={0.3} />
      </mesh>
      <mesh position={[0.4, 0.45, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.5]} />
        <meshStandardMaterial color='#aa0000' transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ============ 가위바위보: 3개 손 회전 ============
export const RPSStand = (props: any) => {
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.6 })
  return (
    <group {...props}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 8]} />
        <meshStandardMaterial color='#8B6914' metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        <meshStandardMaterial color='#888' metalness={0.5} />
      </mesh>
      <group ref={ref} position={[0, 0.9, 0]}>
        {[0, 2.09, 4.19].map((angle, i) => (
          <group key={i} position={[Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.3, 0.15]} />
              <meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71'][i]} />
            </mesh>
            {/* ✊✋✌️ 표현 */}
            {i === 0 && <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.1, 6, 6]} /><meshStandardMaterial color='#ffccaa' /></mesh>}
            {i === 1 && <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.18, 0.08, 0.12]} /><meshStandardMaterial color='#ffccaa' /></mesh>}
            {i === 2 && <>
              <mesh position={[-0.04, 0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12, 4]} /><meshStandardMaterial color='#ffccaa' /></mesh>
              <mesh position={[0.04, 0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12, 4]} /><meshStandardMaterial color='#ffccaa' /></mesh>
            </>}
          </group>
        ))}
      </group>
    </group>
  )
}

// ============ 경마: 원형 트랙 + 달리는 말 ============
export const RaceTrack = (props: any) => {
  const horseRef = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (horseRef.current) {
      const t = s.clock.elapsedTime * 1.5
      horseRef.current.position.x = Math.cos(t) * 0.8
      horseRef.current.position.z = Math.sin(t) * 0.8
      horseRef.current.rotation.y = t + Math.PI / 2
      horseRef.current.position.y = 0.2 + Math.abs(Math.sin(t * 4)) * 0.08
    }
  })
  return (
    <group {...props}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.5, 1.1, 24]} />
        <meshStandardMaterial color='#8B6914' side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.75, 0.78, 24]} />
        <meshStandardMaterial color='#fff' side={THREE.DoubleSide} />
      </mesh>
      {/* 말 */}
      <group ref={horseRef}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.15, 0.1]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        <mesh castShadow position={[0.12, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.12, 0.06]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
      </group>
      {/* 깃발 */}
      <mesh castShadow position={[0, 0.8, 1]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
        <meshStandardMaterial color='#888' />
      </mesh>
      <mesh castShadow position={[0.1, 1.4, 1]}>
        <boxGeometry args={[0.25, 0.15, 0.01]} />
        <meshStandardMaterial color='#e74c3c' />
      </mesh>
    </group>
  )
}
