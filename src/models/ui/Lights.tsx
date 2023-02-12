import * as THREE from 'three'

function Lights() {
  const hemiLight: any = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6)
  hemiLight.color.setHSL(0.6, 1, 0.6)
  hemiLight.groundColor.setHSL(0.095, 1, 0.75)

  const light: any = new THREE.DirectionalLight(0xffffff, 1.0)
  light.position.set(-100, 100, 100)
  light.target.position.set(0, 0, 0)
  light.castShadow = true
  light.shadow.bias = -0.001
  light.shadow.mapSize.width = 4096
  light.shadow.mapSize.height = 4096
  light.shadow.camera.near = -1000
  light.shadow.camera.far = 1000
  light.shadow.camera.left = -100
  light.shadow.camera.right = -100
  light.shadow.camera.top = 100
  light.shadow.camera.bottom = -100
  return (
    <>
      <hemisphereLight {...hemiLight} />
      <directionalLight {...light} />
      <ambientLight intensity={1} />
    </>
  )
}

export default Lights
