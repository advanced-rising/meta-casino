import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 한국 시간(UTC+9) 기반 태양/달 위치 계산
 * 6:00 일출 (동쪽) → 12:00 정오 (위) → 18:00 일몰 (서쪽)
 * 18:00 월출 → 0:00 자정 (위) → 6:00 월몰
 */
function getKoreanHour(): number {
  const now = new Date()
  const utcH = now.getUTCHours()
  const utcM = now.getUTCMinutes()
  const utcS = now.getUTCSeconds()
  return ((utcH + 9) % 24) + utcM / 60 + utcS / 3600
}

export function getDayProgress() {
  const hour = getKoreanHour()
  const sunrise = 6
  const sunset = 18
  const isDay = hour >= sunrise && hour < sunset

  // 태양 각도: 일출(0) → 정오(PI/2) → 일몰(PI)
  let sunAngle: number
  if (isDay) {
    sunAngle = ((hour - sunrise) / (sunset - sunrise)) * Math.PI
  } else {
    // 밤: 달 위치 (일몰~일출 = 0~PI)
    const nightLen = 24 - (sunset - sunrise)
    const nightElapsed = hour >= sunset ? hour - sunset : hour + (24 - sunset)
    sunAngle = (nightElapsed / nightLen) * Math.PI
  }

  // 태양/달의 3D 위치 (동→위→서 아크)
  const celestialX = Math.cos(sunAngle) * 80   // 동(-80) → 서(+80)
  const celestialY = Math.sin(sunAngle) * 100   // 최고점 100
  const celestialZ = 30

  // 조명 강도
  const moonBrightness = Math.sin(sunAngle) * 0.4
  const intensity = isDay ? Math.sin(sunAngle) * 2.0 : 0.6 + moonBrightness
  const ambientIntensity = isDay ? 0.2 + Math.sin(sunAngle) * 0.3 : 0.35 + moonBrightness * 0.3

  // 하늘 색상
  const noon = isDay ? Math.sin(sunAngle) : 0
  const skyColor = isDay
    ? new THREE.Color().lerpColors(new THREE.Color('#ff8c42'), new THREE.Color('#87ceeb'), noon)
    : new THREE.Color('#1a1a3a')
  const groundColor = isDay
    ? new THREE.Color().lerpColors(new THREE.Color('#4a3520'), new THREE.Color('#556b2f'), noon)
    : new THREE.Color('#15152a')
  const sunColor = isDay
    ? new THREE.Color().lerpColors(new THREE.Color('#ff6b35'), new THREE.Color('#fffbe6'), noon)
    : new THREE.Color('#9999cc')

  // Sky 컴포넌트용 sunPosition
  const sunPosition: [number, number, number] = isDay
    ? [celestialX, celestialY, celestialZ]
    : [0, -50, 0] // 밤: 태양 아래로

  // 캔버스 배경색
  let bgColor: string
  if (isDay) {
    if (noon < 0.3) bgColor = '#d4886b' // 일출/일몰
    else bgColor = '#6bb3d4' // 낮
  } else {
    bgColor = '#101025' // 밤 (달빛 반영)
  }

  return { hour, isDay, sunAngle, intensity, ambientIntensity, skyColor, groundColor, sunColor, sunPosition, celestialX, celestialY, celestialZ, bgColor }
}

function Lights() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)
  const hemiRef = useRef<THREE.HemisphereLight>(null!)
  const ambientRef = useRef<THREE.AmbientLight>(null!)

  useFrame(({ camera }) => {
    if (!dirLightRef.current) return
    const light = dirLightRef.current
    const d = getDayProgress()

    // 태양/달 위치 (캐릭터 따라감)
    light.position.set(
      camera.position.x + d.celestialX * 0.5,
      d.celestialY,
      camera.position.z + d.celestialZ,
    )
    light.target.position.set(camera.position.x, 0, camera.position.z)
    light.target.updateMatrixWorld()

    light.intensity = d.intensity
    light.color.copy(d.sunColor)

    if (hemiRef.current) {
      hemiRef.current.color.copy(d.skyColor)
      hemiRef.current.groundColor.copy(d.groundColor)
      hemiRef.current.intensity = d.isDay ? 0.5 : 0.12
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = d.ambientIntensity
    }
  })

  return (
    <>
      <hemisphereLight ref={hemiRef} args={[0x87ceeb, 0x556b2f, 0.5]} />
      <ambientLight ref={ambientRef} intensity={0.3} />
      <directionalLight ref={dirLightRef} castShadow position={[20, 40, 20]} intensity={1.8} color={0xfff5e6}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50}
        shadow-camera-near={0.5} shadow-camera-far={200} shadow-bias={-0.001}>
        <object3D attach='target' position={[0, 0, 0]} />
      </directionalLight>
    </>
  )
}

export default Lights
