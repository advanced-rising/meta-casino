import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react'

import { OrbitControls, Text, Stats, Sky } from '@react-three/drei'

import { socket } from '@/utils/context'
import Scene from '@/models/Scene'
import BaseBox from '@/models/ui/BaseBox'
import Tree from '@/models/ui/Tree'
import BaseScene from '@/models/BaseScene'
import BaseCharacter from '@/models/BaseCharacter'

const Field = ({ id, enteredInput }: { id: any; enteredInput: boolean }) => {
  const [socketClient, setSocketClient] = useState(null)
  const [clients, setClients] = useState({})

  useEffect(() => {
    if (socket) {
      socket.on('move', (clients) => {
        setClients(clients)
      })
    }
  }, [socket])

  return (
    <div className='w-screen h-screen'>
      {clients && socket && (
        // <BaseScene>
        //   <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
        //   <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
        //   <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
        //   {Object.keys(clients)
        //     .filter((clientKey) => clientKey !== socket.id)
        //     .map((client) => {
        //       const { position, rotation } = clients[client]
        //       return (
        //         <BaseCharacter
        //           id={id}
        //           socket={socket}
        //           controls
        //           position={position}
        //           rotation={rotation}
        //           args={[0.5]}
        //           color='yellow'
        //           key={client}
        //           enteredInput={enteredInput}
        //         />
        //       )
        //     })}

        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
        //   <Tree args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
        //   <Sky />
        // </BaseScene>
        <Scene>
          <Sky />
        </Scene>
      )}
    </div>
  )
}

export default Field
