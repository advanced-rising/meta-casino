function Lights() {
  return (
    <>
      <ambientLight intensity={1} />
      <spotLight position={[10, 10, 5]} castShadow={true} penumbra={0.5} />
    </>
  )
}

export default Lights
