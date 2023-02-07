import React from 'react'

import { useImmer } from 'use-immer'

import Header from '@/config'
import Field from '@/models/Field'
import Message from '@/components/dom/Message'
import { socket } from '@/utils/context'
interface Props {
  id: any
}

const RoomIn = (props: Props) => {
  const { id } = props
  const [enteredInput, setEnteredInput] = useImmer(true)

  return (
    <>
      <Header title={id || ''} />
      {socket && (
        <div>
          <Message id={id} setEnteredInput={setEnteredInput} socket={socket} />
          <Field id={id} enteredInput={enteredInput} socket={socket} />
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
