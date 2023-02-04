import { useControls } from 'leva'

function Lights() {
  const ambientCtl = useControls('Ambient Light', {
    visible: false,
    intensity: {
      value: 1.0,
      min: 0,
      // max: 1.0,
      // step: 0.1,
    },
  })

  const directionalCtl = useControls('Directional Light', {
    visible: true,
    position: {
      x: 10,
      y: 10,
      z: 5,
    },
    castShadow: true,
  })

  const pointCtl = useControls('Point Light', {
    visible: false,
    position: {
      x: 2,
      y: 0,
      z: 0,
    },
    castShadow: true,
  })

  const spotCtl = useControls('Spot Light', {
    visible: false,
    position: {
      x: 10,
      y: 10,
      z: 5,
    },
    castShadow: true,
  })

  return (
    <>
      <ambientLight intensity={ambientCtl.intensity} />
      {/* <directionalLight
        // visible={directionalCtl.visible}
        position={[directionalCtl.position.x, directionalCtl.position.y, directionalCtl.position.z]}
        castShadow={directionalCtl.castShadow}
      /> */}
      {/* <pointLight
        visible={pointCtl.visible}
        position={[pointCtl.position.x, pointCtl.position.y, pointCtl.position.z]}
        castShadow={pointCtl.castShadow}
      /> */}
      <spotLight
        // visible={spotCtl.visible}
        position={[spotCtl.position.x, spotCtl.position.y, spotCtl.position.z]}
        castShadow={spotCtl.castShadow}
        penumbra={0.5}
      />
      {/* <spotLight penumbra={0.5} position={[10, 10, 5]} castShadow /> */}
    </>
  )
}

export default Lights
