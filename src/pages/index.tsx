import dynamic from 'next/dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useFormik, FormikProvider, Form } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import { socket } from '@/utils/context'
import { useJoinRoom, useWatingRoom } from '@/utils/hook'
import { IRoom } from 'server/repository/rooms'
import { CREATE_ROOM_REQUEST } from 'server/handler/SocketRoom'
import Header from '@/config'
import Field from '@/models/Field'
import { io } from 'socket.io-client'
import Message from '@/components/dom/Message'
import { useImmer } from 'use-immer'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  useJoinRoom(socket, 'wating-room')
  const router = useRouter()
  const { rooms } = useWatingRoom(socket)
  const [enteredInput, setEnteredInput] = useImmer(true)

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
      <Header title='META CASINO' />
      <div className='w-full'>
        {socketClient && (
          <div>
            <Message id={socketClient.id} setEnteredInput={setEnteredInput} socket={socketClient} />
            <Field enteredInput={enteredInput} socket={socketClient} clients={clients} />
          </div>
        )}
      </div>
    </>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
// Page.canvas = (props) => {
//   return <Logo scale={0.5} route='/blob' position-y={-1} />
// }

// export async function getStaticProps() {
//   return { props: { title: 'Index' } }
// }
