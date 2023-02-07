import React, { useEffect, useState, Suspense, useRef } from 'react'

import { Sky, Loader, softShadows, OrbitControls, Text } from '@react-three/drei'

import BaseBox from '@/models/ui/BaseBox'
import { Canvas } from '@react-three/fiber'
import Lights from '@/models/ui/Lights'
import { Physics } from '@react-three/cannon'
import Character from '@/models/Character'
import Floor from '@/models/ui/Floor'
import Tree from '@/models/ui/Tree'
import { useJoinNewUser } from '@/utils/hook'
import { io } from 'socket.io-client'

softShadows()
const Field = ({ id, enteredInput, socket }: { id: any; enteredInput: boolean; socket: any }) => {
  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      setIsSet(true)
    }
  }, [])

  const [socketClient, setSocketClient] = useState(null)
  const [clients, setClients] = useState({})

  useEffect(() => {
    // On mount initialize the socket connection
    setSocketClient(io())

    // Dispose gracefuly
    return () => {
      if (socketClient) socketClient.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socketClient) {
      socketClient.on('move', (clients) => {
        setClients(clients)
      })
    }
  }, [socketClient])

  return (
    socketClient &&
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
            <Lights />
            <Suspense fallback={null}>
              {Object.keys(clients).map((client) => {
                const { position, rotation } = clients[client]
                return (
                  <Character
                    key={client}
                    socket={socketClient}
                    enteredInput={enteredInput}
                    id={client}
                    position={position}
                    rotation={rotation}
                  />
                )
              })}
            </Suspense>
            <Floor rotation={[Math.PI / -2, 0, 0]} color='white' />
            <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
            <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
            <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
            <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
            <Sky />
          </Physics>
        </Canvas>

        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
      </div>
    )
  )
}

export default Field
