import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Lights() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)

  // 태양이 카메라(캐릭터) 위치를 따라가도록
  useFrame(({ camera }) => {
    if (!dirLightRef.current) return
    const light = dirLightRef.current

    // 태양 위치: 캐릭터 기준 오른쪽 위에서 비춤
    light.position.set(
      camera.position.x + 20,
      camera.position.y + 40,
      camera.position.z + 20,
    )

    // 그림자가 캐릭터 주변을 비추도록 target 업데이트
    light.target.position.set(
      camera.position.x - 10,
      0,
      camera.position.z - 10,
    )
    light.target.updateMatrixWorld()
  })

  return (
    <>
      {/* 환경광 (하늘색 + 땅색) */}
      <hemisphereLight args={[0x87ceeb, 0x556b2f, 0.5]} />
      <ambientLight intensity={0.3} />

      {/* 태양광 - 캐릭터를 따라다니며 그림자 생성 */}
      <directionalLight
        ref={dirLightRef}
        castShadow
        position={[20, 40, 20]}
        intensity={1.8}
        color={0xfff5e6}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={150}
        shadow-bias={-0.001}
      >
        <object3D attach='target' position={[0, 0, 0]} />
      </directionalLight>
    </>
  )
}

export default Lights
