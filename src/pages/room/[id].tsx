import React, { useEffect, useState, useRef, useCallback } from 'react'
import { NextPage } from 'next'
import { useJoinRoom, useJoinNewUser } from '../../utils/hook'
import { socket } from '../../utils/context'
import { IN_ROOM_USER, NEW_MESSAGE, SEND_MESSAEGE } from '../../../server/handler/SocketRoom'
import { v4 as uuid } from 'uuid'
import { useImmer } from 'use-immer'
import Scene from '@/components/canvas/Scene'
import { OrbitControls, Text, Stats, Sky } from '@react-three/drei'
import { io } from 'socket.io-client'
import usePlayerControls from '@/templates/hooks/usePlayerControls'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Physics, useSphere } from '@react-three/cannon'
import BaseBox from '@/components/ui/BaseBox'
import ThreeModel from '@/components/ui/ThreeModel'
import BaseCharacter from '@/components/ui/BaseCharacter'
import BaseScene from '@/components/ui/BaseScene'

const ControlsWrapper = ({ socket }) => {
  const controlsRef = useRef()
  const [updateCallback, setUpdateCallback] = useState(null)

  // Register the update event and clean up
  useEffect(() => {
    const onControlsChange = (val) => {
      const { position, rotation } = val.target.object
      const { id } = socket

      const posArray = []
      const rotArray = []

      position.toArray(posArray)
      rotation.toArray(rotArray)

      socket.emit('move', {
        id,
        rotation: rotArray,
        position: posArray,
      })
    }

    if (controlsRef && controlsRef.current) {
      // @ts-ignore
      return setUpdateCallback(controlsRef!.current!.addEventListener('change', onControlsChange))
    }

    // Dispose
    return () => {
      if (updateCallback && controlsRef.current) {
        // @ts-ignore
        return controlsRef!.current!.removeEventListener('change', onControlsChange)
      }
    }
  }, [controlsRef, socket])

  return <OrbitControls ref={controlsRef} />
}

const UserWrapper = ({ position, rotation, id, ...props }) => {
  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()
  const speed = new THREE.Vector3()
  const SPEED = 5

  const { camera } = useThree()

  const [ref, api] = useSphere((index) => ({
    mass: 1,
    type: 'Dynamic',

    position: [0, 10, 0],
    ...props,
  }))

  const { forward, backward, left, right, jump } = usePlayerControls()
  const velocity = useRef([0, 0, 0])
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [])

  useFrame((state) => {
    ref.current.getWorldPosition(camera.position)
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(camera.rotation)
    speed.fromArray(velocity.current)

    api.velocity.set(direction.x, velocity.current[1], direction.z)
    if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05)
      api.velocity.set(velocity.current[0], 5, velocity.current[2])
  })

  return (
    <mesh ref={ref} position={position}>
      {/* Optionally show the ID above the user's mesh */}
      {/* @ts-ignore */}
      <Text position={[0, 1.0, 0]} color='black' anchorX='center' anchorY='middle' fontSize={0.3}>
        {id}
      </Text>
      <sphereGeometry />
      <meshStandardMaterial color='#FFFF00' />
    </mesh>
  )
}

const useNewMessage = () => {
  const [message, setMessage] = useState<{
    message: string
    senderId: string
    chatId: string
  }>()

  useEffect(() => {
    socket.on(NEW_MESSAGE, (ack: { message: string; senderId: string; chatId: string }) => {
      setMessage(ack)
    })

    return () => {
      socket.off(NEW_MESSAGE)
    }
  }, [])

  return { message }
}

type Props = {
  id: any
}

const RoomIn: NextPage<Props> = (props) => {
  const [chats, setChats] = useImmer<any>([])
  const [message, setMessage] = useState('')
  useJoinRoom(socket, `/room/${props.id}`)
  const { message: newMessage } = useNewMessage()
  const { id } = useJoinNewUser(socket)
  const chatContainerRef = useRef<any>()

  const roomInEventEmitter = () => {
    socket.emit(IN_ROOM_USER)
  }

  const newUserJoinHandler = () => {
    setChats(chats.concat({ type: 'new', userId: id, chatId: uuid() }))
  }

  const sendMessage = (e: React.KeyboardEvent) => {
    let abc = 0
    if (e.key === 'Enter' && message.length > 0 && !message) {
      console.log('message ######', message, (abc += 1))
      socket.emit(SEND_MESSAEGE, {
        roomId: props.id,
        message,
      })
      return setMessage('')
    }
  }

  useEffect(() => {
    if (newMessage) {
      console.log('newMessage,newMessage', newMessage)
      setChats((draft) =>
        draft.concat({
          type: 'message',
          message: newMessage.message,
          senderId: newMessage.senderId,
          chatId: newMessage.chatId,
        }),
      )

      chatContainerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [newMessage])

  useEffect(roomInEventEmitter, [])

  useEffect(() => {
    id && newUserJoinHandler()
  }, [id])

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
    <>
      <div>
        <h3>
          hello world room <small>{props.id}</small>
        </h3>
        <div
          style={{
            width: 800,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
          }}>
          <ul className='flex flex-col overflow-y-scroll'>
            {chats.map((chat: any) => {
              if (chat.type === 'new') {
                return <li key={chat.chatId}>{chat.userId} 님이 입장하셨습니다.</li>
              } else if (chat.type === 'message') {
                return <li key={chat.chatId}>{chat.message}</li>
              }
            })}
            <li ref={chatContainerRef} style={{ listStyleType: 'none', height: 50 }}></li>
          </ul>
          <input
            className='block w-full text-black h-[50px]'
            type='text'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyDown={sendMessage}
          />
        </div>
        <div className='w-screen h-screen'>
          {socketClient && (
            // <Scene>
            //   <Stats />
            //   <ControlsWrapper socket={socketClient} />
            //   <gridHelper rotation={[0, 0, 0]} />

            //   {/* Filter myself from the client list and create user boxes with IDs */}
            //   <Physics>
            //     <group>
            //       {Object.keys(clients)
            //         .filter((clientKey) => clientKey !== socketClient.id)
            //         .map((client) => {
            //           const { position, rotation } = clients[client]
            //           return <UserWrapper key={client} id={client} position={position} rotation={rotation} />
            //         })}
            //     </group>
            //   </Physics>
            // </Scene>
            <BaseScene>
              <BaseBox text={false} position={[0, 0.5, 0]} args={[2, 1, 2]} color='red' />
              <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
              <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
              {Object.keys(clients)
                .filter((clientKey) => clientKey !== socketClient.id)
                .map((client) => {
                  const { position, rotation } = clients[client]
                  return (
                    <BaseCharacter
                      socketClient={socketClient}
                      controls
                      position={[0, 2, 0]}
                      args={[0.5]}
                      color='yellow'
                      key={client}
                      rotation={rotation}
                    />
                  )
                })}

              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, -5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, 10]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-10, 0, 5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[-5, 0, -5]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[0, 0, -10]} />
              <ThreeModel args={[0.5, 2, 0.5]} scale={0.5} position={[10, 0, 5]} />
              <Sky />
            </BaseScene>
          )}
        </div>
      </div>
    </>
  )
}

RoomIn.getInitialProps = async ({ query }) => {
  return {
    id: query.id,
  }
}

export default RoomIn
