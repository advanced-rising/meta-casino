import { useEffect, useState } from 'react'
import { socket } from '@/utils/context'
import Header from '@/config'
import Field from '@/models/Field'
import Message from '@/components/dom/Message'
import { useImmer } from 'use-immer'
import { useAppDispatch } from '@/redux/storeHooks'
import { enterSpace } from '@/redux/slices/space'
import HUD from '@/components/dom/HUD'

export default function Home() {
  const dispatch = useAppDispatch()
  const [enteredInput, setEnteredInput] = useImmer(true)
  const [ready, setReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [clients, setClients] = useState({})
  const [nickname, setNickname] = useState('unknown')

  useEffect(() => {
    setReady(true)
    dispatch(enterSpace())

    if (socket && socket.on) {
      const onConnect = () => setConnected(true)
      if (socket.connected) setConnected(true)
      socket.on('connect', onConnect)
      socket.on('move', (data: any) => setClients(data))
      return () => { socket.off('connect', onConnect); socket.off('move') }
    }
  }, [])

  if (!ready) return <Header title='META CASINO' />

  return (
    <>
      <Header title='META CASINO' />
      <div className='fixed top-0 w-full h-full z-[1000]'>
        {connected && (
          <Message id={socket?.id || 'local'} setEnteredInput={setEnteredInput}
            socket={socket} nickname={nickname} setNickname={setNickname} />
        )}
        <HUD />
        <Field enteredInput={enteredInput} socket={socket} clients={clients} nickname={nickname} />
      </div>
    </>
  )
}
