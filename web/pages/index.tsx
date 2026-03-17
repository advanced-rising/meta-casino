import dynamic from 'next/dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { socket } from '@/utils/context'
import { useJoinRoom, useWatingRoom } from '@/utils/hook'
import Header from '@/config'
import Field from '@/models/Field'
import Message from '@/components/dom/Message'
import { useImmer } from 'use-immer'
import { useAppDispatch, useAppSelector } from '@/redux/storeHooks'
import { enterSpace } from '@/redux/slices/space'
import TextGroup from '@/components/dom/TextGroup'
import HUD from '@/components/dom/HUD'

export default function Home(props) {
  const space = useAppSelector((state) => state.space)

  useJoinRoom(socket, 'wating-room')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { rooms } = useWatingRoom(socket)
  const [enteredInput, setEnteredInput] = useImmer(true)

  const [connected, setConnected] = useState(false)
  const [clients, setClients] = useState({})
  const [nickname, setNickname] = useState('unknown')

  useEffect(() => {
    // Socket is already initialized in context.ts
    const onConnect = () => {
      setConnected(true)
    }

    if (socket.connected) {
      setConnected(true)
    }

    socket.on('connect', onConnect)

    socket.on('move', (clientsData) => {
      setClients(clientsData)
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('move')
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      dispatch(enterSpace())
    }, 1000)
  }, [])

  return (
    <>
      <Header title='META CASINO' />

      {connected && (
        <div className='fixed top-0 w-full h-full z-[1000]'>
          <Message
            id={socket.id}
            setEnteredInput={setEnteredInput}
            socket={socket}
            nickname={nickname}
            setNickname={setNickname}
          />
          <TextGroup />
          <HUD />
          <Field enteredInput={enteredInput} socket={socket} clients={clients} nickname={nickname} />
        </div>
      )}
    </>
  )
}
