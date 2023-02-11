import React, { useEffect, useState, useRef, useCallback } from 'react'

import { IN_ROOM_USER, NEW_MESSAGE, SEND_MESSAEGE } from 'server/handler/SocketRoom'
import { v4 as uuid } from 'uuid'
import { useImmer } from 'use-immer'

import { useFormik, FormikProvider, Form } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/router'

import { useJoinNewUser, useJoinRoom, useNewMessage } from '@/utils/hook'
import useModals from '@/hooks/useModals'

import EnterSpace from '@/components/modal/EnterSpace'

const Message = ({ id, setEnteredInput, socket }: { id: any; setEnteredInput: any; socket: any }) => {
  const [chats, setChats] = useImmer<any>([])
  useJoinRoom(socket, `home`)
  const { message: newMessage } = useNewMessage()
  const { id: socketId, nickname } = useJoinNewUser(socket)
  const chatContainerRef = useRef<any>()
  const router = useRouter()
  const [nick, setNick] = useImmer<string>('unknwon')
  const roomInEventEmitter = () => {
    socket.emit(IN_ROOM_USER, {
      nickname: nick,
    })
  }

  const newUserJoinHandler = () => {
    if (!nick) return
    setChats(chats.concat({ type: 'new', userId: socket.id, chatId: socket.id, nickname: nick || 'unknwon' }))
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
          roomId: id,
          message: values.message,
          chatId: socket.id,
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
    <div className='fixed top-0 w-full h-[200px] z-[100] '>
      <div className='flex items-center justify-start bg-[#00000033] pt-[20px]'>
        <h3 className='text-black  px-[20px]'>META CASINO</h3>

        {nick === 'unknwon' ? (
          <FormikProvider value={nickFormik}>
            <Form onSubmit={nickFormik.handleSubmit}>
              <input
                onFocus={() => setEnteredInput(false)}
                onBlur={() => setEnteredInput(true)}
                placeholder='닉네임을 입력하세요.'
                className='block  text-black h-[30px] px-20px rounded-md w-[200px]'
                name='nickname'
                type='text'
                onChange={nickFormik.handleChange}
                value={nickFormik.values.nickname}
              />
            </Form>
          </FormikProvider>
        ) : (
          <p>Your Nick : {nick}</p>
        )}
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
  )
}

export default Message
