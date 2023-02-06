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
        <Scene socket={socket}>
          <Sky />
        </Scene>
      )}
    </div>
  )
}

export default Field
