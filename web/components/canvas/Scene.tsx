import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
interface Props {
  children: React.ReactNode
}

export default function Scene({ children, ...props }: Props) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas style={{ width: '100%', height: '100%' }} {...props}>
      <directionalLight intensity={0.75} />
      <ambientLight intensity={0.75} />
      {children}
      <Preload all />
      <OrbitControls />
    </Canvas>
  )
}
