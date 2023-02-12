import React from 'react'

import { useImmer } from 'use-immer'

import Header from '@/config'
import Field from '@/models/Field'
import Message from '@/components/dom/Message'

interface Props {
  id: any
}

const RoomIn = (props: Props) => {
  const { id } = props
  const [enteredInput, setEnteredInput] = useImmer(true)

  return (
    <>
      <Header title={id || ''} />
      <div>
        <Message id={id} setEnteredInput={setEnteredInput} />
        <Field id={id} enteredInput={enteredInput} />
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
