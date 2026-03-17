import { useBox } from '@react-three/cannon'

// 보이지 않는 물리 벽 (맵 경계용)
const Wall = ({ position, args }: { position: [number, number, number]; args: [number, number, number] }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args,
  }))

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default Wall
