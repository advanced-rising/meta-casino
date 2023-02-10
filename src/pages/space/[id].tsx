import React, { useEffect, useState } from 'react'

import { useImmer } from 'use-immer'

import Header from '@/config'
import Field from '@/models/Field'
import Message from '@/components/dom/Message'

import { io } from 'socket.io-client'
interface Props {
  id: any
}

const RoomIn = (props: Props) => {
  const { id } = props
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
      <Header title={id || ''} />
      {socketClient && (
        <div>
          <Message id={id} setEnteredInput={setEnteredInput} socket={socketClient} />
          <Field enteredInput={enteredInput} socket={socketClient} clients={clients} />
        </div>
      )}
    </>
  )
}

RoomIn.getInitialProps = async ({ query }) => {
  return {
    id: query.id,
  }
}

export default RoomIn
