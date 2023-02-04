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

interface Props {
  id: any
}

const RoomIn = (props: Props) => {
  const [chats, setChats] = useImmer<any>([])
  useJoinRoom(socket, `/room/${props.id}`)
  const { message: newMessage } = useNewMessage()
  const { id, nickname } = useJoinNewUser(socket)
  const chatContainerRef = useRef<any>()
  const router = useRouter()
  const [enteredInput, setEnteredInput] = useImmer(true)
  const [nick, setNick] = useImmer<string>('unknwon')
  const roomInEventEmitter = () => {
    socket.emit(IN_ROOM_USER, {
      nickname: nick,
    })
  }

  console.log('id', id)
  console.log('client - nickname', nickname)

  const newUserJoinHandler = () => {
    if (!nick) return
    setChats(chats.concat({ type: 'new', userId: id, chatId: uuid(), nickname: nick || 'unknwon' }))
  }

  useEffect(() => {
    if (newMessage) {
      setChats((draft) =>
        draft.concat({
          type: 'message',
          message: newMessage.message,
          senderId: newMessage.senderId,
          chatId: newMessage.chatId,
          nickname: newMessage.nickname,
        }),
      )

      chatContainerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [newMessage])

  useEffect(roomInEventEmitter, [nick])

  useEffect(() => {
    id && newUserJoinHandler()
  }, [id])

  const [socketClient, setSocketClient] = useState(null)
  // const [clients, setClients] = useState({})

  useEffect(() => {
    // On mount initialize the socket connection
    setSocketClient(io())

    // Dispose gracefuly
    return () => {
      if (socketClient) socketClient.disconnect()
    }
  }, [])

  // useEffect(() => {
  //   if (socketClient) {
  //     socketClient.on('move', (clients) => {
  //       setClients(clients)
  //     })
  //   }
  // }, [socketClient])

  const formik = useFormik({
    initialValues: {
      message: '',
    },
    validationSchema: Yup.object({
      message: Yup.string().required(),
    }),
    onSubmit: async (values, fn) => {
      if (values.message.length > 0 && values.message) {
        socket.emit(SEND_MESSAEGE, {
          roomId: props.id,
          message: values.message,
          chatId: uuid(),
          nickname: nick || 'unknwon',
        })
        fn.resetForm()
        fn.setFieldValue('message', '')
      }
    },
  })

  const nickFormik = useFormik({
    initialValues: {
      nickname: '',
    },
    validationSchema: Yup.object({
      nickname: Yup.string().required(),
    }),
    onSubmit: async (values, fn) => {
      setNick(values.nickname)
      fn.setFieldValue('nickname', '')
    },
  })

  return (
    <>
      <Header title={id || ''} />
      <div>
        <div className='fixed w-full h-[200px] z-[1000] '>
          <div className='flex self-center justify-start bg-[#00000033] pt-[20px]'>
            <h3 className='text-black  px-[40px]'>
              CASINO Room <small>{props.id}</small>
            </h3>
            <FormikProvider value={nickFormik}>
              <Form onSubmit={nickFormik.handleSubmit}>
                <input
                  onFocus={() => setEnteredInput(false)}
                  onBlur={() => setEnteredInput(true)}
                  placeholder='닉네임을 입력하세요.'
                  className='block  text-black h-[30px] px-20px'
                  name='nickname'
                  type='text'
                  onChange={nickFormik.handleChange}
                  value={nickFormik.values.nickname}
                />
              </Form>
            </FormikProvider>
          </div>
          <ul className='flex flex-col self-end h-full overflow-y-scroll bg-[#00000033] px-[40px] pb-[40px] pt-[60px]'>
            {chats.map((chat: any) => {
              if (chat.type === 'new') {
                return (
                  <li key={chat.chatId} className='text-white'>
                    {chat.nickname || 'unknwon'} 님이 입장하셨습니다.
                  </li>
                )
              } else if (chat.type === 'message') {
                return (
                  <li key={chat.chatId} className='text-white'>
                    {chat.nickname || 'unknwon'} : {chat.message}
                  </li>
                )
              } else if (chat.type === 'disconnect') {
                return (
                  <li key={chat.chatId} className='text-white'>
                    {chat.nickname || 'unknwon'} : {chat.message}
                  </li>
                )
              }
            })}
            <li ref={chatContainerRef} className='list-none h-[50px]'></li>
          </ul>
          <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit}>
              <input
                onFocus={() => setEnteredInput(false)}
                onBlur={() => setEnteredInput(true)}
                name='message'
                className='block w-full text-black h-[50px] px-20px'
                type='text'
                onChange={formik.handleChange}
                value={formik.values.message}
              />
            </Form>
          </FormikProvider>
        </div>
        <div className='w-screen h-screen'>
          {socketClient && socket && (
            <BaseScene>
              <BaseBox text={false} position={[-5, 0.5, 0]} args={[2, 1, 2]} color='red' />
              <BaseBox text={false} position={[5, 1, 0]} args={[1.5, 2, 1.3]} color='orange' />
              <BaseBox text={false} position={[0, 0.5, 5]} args={[3, 1, 1.3]} color='green' />
              {Object.keys(socket)
                .filter((clientKey) => clientKey !== socketClient.id)
                .map((client) => {
                  const { position, rotation } = socket[client]
                  return (
                    <BaseCharacter
                      id={id}
                      socket={socket}
                      controls
                      position={position}
                      rotation={rotation}
                      args={[0.5]}
                      color='yellow'
                      key={client}
                      enteredInput={enteredInput}
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
