import React, { useEffect, useState, useRef, useCallback } from 'react'

import { IN_ROOM_USER, NEW_MESSAGE, SEND_MESSAEGE } from 'server/handler/SocketRoom'
import { v4 as uuid } from 'uuid'
import { useImmer } from 'use-immer'
import { OrbitControls, Text, Stats, Sky } from '@react-three/drei'
import { io } from 'socket.io-client'

import BaseBox from '@/components/ui/BaseBox'
import ThreeModel from '@/components/ui/ThreeModel'
import BaseCharacter from '@/components/ui/BaseCharacter'
import BaseScene from '@/components/ui/BaseScene'
import { useFormik, FormikProvider, Form } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'

import { socket } from '@/utils/context'
import { useJoinNewUser, useJoinRoom, useNewMessage } from '@/utils/hook'
import Header from '@/config'
import Field from '@/components/canvas/Field'
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
