import React, { useEffect, useState, Suspense } from 'react'

import { Sky, Loader, softShadows } from '@react-three/drei'

import { socket } from '@/utils/context'

import BaseBox from '@/models/ui/BaseBox'
import { Canvas } from '@react-three/fiber'
import Lights from '@/models/ui/Lights'
import { Physics } from '@react-three/cannon'
import Character from '@/models/Character'
import Floor from '@/models/ui/Floor'
import Tree from '@/models/ui/Tree'

softShadows()
const Field = ({ id, enteredInput }: { id: any; enteredInput: boolean }) => {
  const [clients, setClients] = useState({})

  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      setIsSet(true)
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('move', (clients) => {
        setClients(clients)
      })
    }
  }, [socket])

  return (
    isSet &&
    clients &&
    socket && (
      <div className='w-full h-screen bg-white'>
        <Canvas
          shadows={'soft'}
          camera={{
            zoom: 100,
            position: [1, 5, 5],
            left: -(window.innerWidth / window.innerHeight),
            right: window.innerWidth / window.innerHeight,
            top: 1,
            bottom: -1,
            near: -1000,
            far: 1000,
          }}
          orthographic>
          <Physics gravity={[0, -9.8, 0]}>
            <Suspense fallback={null}>
              <Lights />
              <Character socket={socket} enteredInput={enteredInput} />

              <Floor rotation={[Math.PI / -2, 0, 0]} color='white' />
            </Suspense>
            <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
            <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
            <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
            <fog attach='fog' color='#ffffff' near={50} far={300} />
          </Physics>
          <Sky />
        </Canvas>

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </div>
    )
  )
}

export default Field
