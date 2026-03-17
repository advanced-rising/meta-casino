import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 한국 시간 기반 낮/밤 조명 시스템
 * 6시~18시: 낮 (태양)
 * 18시~6시: 밤 (달 + 가로등)
 */
function getKoreanHour(): number {
  const now = new Date()
  // UTC+9 (한국)
  const utcHours = now.getUTCHours()
  const utcMinutes = now.getUTCMinutes()
  return ((utcHours + 9) % 24) + utcMinutes / 60
}

function getDayProgress(): {
  hour: number
  isDay: boolean
  sunAngle: number // 0~PI (일출~일몰)
  intensity: number // 0~1
  skyColor: THREE.Color
  groundColor: THREE.Color
  sunColor: THREE.Color
  ambientIntensity: number
} {
  const hour = getKoreanHour()
  const sunrise = 6
  const sunset = 18

  const isDay = hour >= sunrise && hour < sunset

  let sunAngle: number
  let intensity: number
  let ambientIntensity: number

  if (isDay) {
    // 낮: 6시=0, 12시=PI/2, 18시=PI
    const dayProgress = (hour - sunrise) / (sunset - sunrise)
    sunAngle = dayProgress * Math.PI
    // 정오에 최대, 일출/일몰에 약함
    intensity = Math.sin(sunAngle) * 1.8
    ambientIntensity = 0.2 + Math.sin(sunAngle) * 0.3
  } else {
    // 밤: 달빛
    const nightProgress = hour >= sunset
      ? (hour - sunset) / (24 - sunset + sunrise)
      : (hour + 24 - sunset) / (24 - sunset + sunrise)
    sunAngle = nightProgress * Math.PI
    intensity = 0.15
    ambientIntensity = 0.08
  }

  // 색상
  let skyColor: THREE.Color
  let groundColor: THREE.Color
  let sunColor: THREE.Color

  if (isDay) {
    const noon = Math.sin(sunAngle)
    // 일출/일몰: 주황, 정오: 하늘색
    skyColor = new THREE.Color().lerpColors(new THREE.Color('#ff8c42'), new THREE.Color('#87ceeb'), noon)
    groundColor = new THREE.Color().lerpColors(new THREE.Color('#4a3520'), new THREE.Color('#556b2f'), noon)
    sunColor = new THREE.Color().lerpColors(new THREE.Color('#ff6b35'), new THREE.Color('#fff5e6'), noon)
  } else {
    skyColor = new THREE.Color('#0a0a2a')
    groundColor = new THREE.Color('#0a0a15')
    sunColor = new THREE.Color('#8888cc') // 달빛 (차가운 청백)
  }

  return { hour, isDay, sunAngle, intensity, skyColor, groundColor, sunColor, ambientIntensity }
}

function Lights() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)
  const hemiRef = useRef<THREE.HemisphereLight>(null!)
  const ambientRef = useRef<THREE.AmbientLight>(null!)

  useFrame(({ camera }) => {
    if (!dirLightRef.current) return
    const light = dirLightRef.current
    const day = getDayProgress()

    // 태양/달 위치: 캐릭터 기준
    const sunX = Math.cos(day.sunAngle) * 40
    const sunY = Math.sin(day.sunAngle) * 50 + 5
    light.position.set(camera.position.x + sunX, sunY, camera.position.z + 20)
    light.target.position.set(camera.position.x, 0, camera.position.z)
    light.target.updateMatrixWorld()

    // 강도 + 색상
    light.intensity = day.intensity
    light.color.copy(day.sunColor)

    // 환경광
    if (hemiRef.current) {
      hemiRef.current.color.copy(day.skyColor)
      hemiRef.current.groundColor.copy(day.groundColor)
      hemiRef.current.intensity = day.isDay ? 0.5 : 0.15
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = day.ambientIntensity
    }
  })

  return (
    <>
      <hemisphereLight ref={hemiRef} args={[0x87ceeb, 0x556b2f, 0.5]} />
      <ambientLight ref={ambientRef} intensity={0.3} />

      <directionalLight
        ref={dirLightRef}
        castShadow
        position={[20, 40, 20]}
        intensity={1.8}
        color={0xfff5e6}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-bias={-0.001}
      >
        <object3D attach='target' position={[0, 0, 0]} />
      </directionalLight>
    </>
  )
}

export { getDayProgress }
export default Lights
