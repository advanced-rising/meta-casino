import React, { useEffect, useRef, useState } from 'react'

import { IN_ROOM_USER, NEW_MESSAGE, SEND_MESSAGE } from '@/utils/socketEvents'
import { useImmer } from 'use-immer'

import { useFormik, FormikProvider, Form } from 'formik'
import * as Yup from 'yup'

import { useJoinRoom } from '@/utils/hook'

const Message = ({
  id,
  setEnteredInput,
  socket,
  nickname,
  setNickname,
}: {
  id: any
  setEnteredInput: any
  socket: any
  nickname: string
  setNickname: (n: string) => void
}) => {
  const [chats, setChats] = useImmer<any>([])
  const [chatOpen, setChatOpen] = useState(true)
  useJoinRoom(socket, `home`)
  const chatContainerRef = useRef<HTMLLIElement>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const handleNewMessage = (msg: { message: string; senderId: string; chatId: string; nickname: string }) => {
      setChats((draft: any) =>
        draft.concat({
          type: 'message',
          message: msg.message,
          senderId: msg.senderId,
          chatId: msg.chatId + Date.now(),
          nickname: msg.nickname,
        }),
      )
      if (!chatOpen) setUnread((n) => n + 1)
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 50)
    }

    const handleNewUser = ({ id: userId, nickname: userNick }: { id: string; nickname: string }) => {
      setChats((draft: any) =>
        draft.concat({
          type: 'new',
          userId,
          chatId: userId + Date.now(),
          nickname: userNick || 'unknown',
        }),
      )
    }

    socket.on(NEW_MESSAGE, handleNewMessage)
    socket.on(IN_ROOM_USER, handleNewUser)

    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage)
      socket.off(IN_ROOM_USER, handleNewUser)
    }
  }, [socket, chatOpen])

  useEffect(() => {
    if (nickname && nickname !== 'unknown') {
      socket.emit(IN_ROOM_USER, { nickname })
    }
  }, [nickname])

  const formik = useFormik({
    initialValues: { message: '' },
    validationSchema: Yup.object({ message: Yup.string().required() }),
    onSubmit: async (values, fn) => {
      if (values.message.length > 0) {
        socket.emit(SEND_MESSAGE, {
          roomId: id,
          message: values.message,
          chatId: socket.id,
          nickname: nickname || 'unknown',
        })
        fn.resetForm()
      }
    },
  })

  const nickFormik = useFormik({
    initialValues: { nickname: '' },
    validationSchema: Yup.object({ nickname: Yup.string().required() }),
    onSubmit: async (values, fn) => {
      setNickname(values.nickname)
      fn.setFieldValue('nickname', '')
    },
  })

  return (
    <>
      {/* 상단 바 */}
      <div className='fixed top-0 left-0 right-0 z-[150] flex items-center h-[40px] bg-[#000000aa] px-[16px]'>
        <span className='text-white text-[14px] font-bold'>META CASINO</span>
        <div className='ml-[16px]'>
          {nickname === 'unknown' ? (
            <FormikProvider value={nickFormik}>
              <Form onSubmit={nickFormik.handleSubmit} className='flex gap-[8px]'>
                <input
                  onFocus={() => setEnteredInput(false)}
                  onBlur={() => setEnteredInput(true)}
                  placeholder='닉네임 입력 후 Enter'
                  className='text-white bg-[#ffffff22] h-[28px] px-[10px] rounded text-[12px] w-[160px] outline-none placeholder-gray-400'
                  name='nickname'
                  type='text'
                  onChange={nickFormik.handleChange}
                  value={nickFormik.values.nickname}
                />
              </Form>
            </FormikProvider>
          ) : (
            <span className='text-green-300 text-[13px]'>{nickname}</span>
          )}
        </div>
      </div>

      {/* 좌측 하단 채팅창 (게임 스타일) */}
      <div className='fixed bottom-[10px] left-[10px] z-[150] w-[320px]'>
        {/* 채팅 토글 버튼 */}
        <button
          className='mb-[4px] text-[11px] text-gray-300 bg-[#00000077] px-[8px] py-[2px] rounded hover:text-white'
          onClick={() => {
            setChatOpen(!chatOpen)
            if (!chatOpen) setUnread(0)
          }}>
          {chatOpen ? '채팅 닫기' : `채팅 열기${unread > 0 ? ` (${unread})` : ''}`}
        </button>

        {chatOpen && (
          <div className='bg-[#000000aa] rounded-[8px] overflow-hidden'>
            {/* 메시지 목록 */}
            <ul className='h-[160px] overflow-y-auto px-[10px] py-[6px] flex flex-col gap-[2px]'>
              {chats.length === 0 && (
                <li className='text-gray-500 text-[11px] italic'>채팅이 없습니다</li>
              )}
              {chats.map((chat: any) => {
                if (chat.type === 'new') {
                  return (
                    <li key={chat.chatId} className='text-yellow-400 text-[11px]'>
                      {chat.nickname} 님이 입장했습니다
                    </li>
                  )
                } else if (chat.type === 'message') {
                  const isMe = chat.senderId === socket.id
                  return (
                    <li key={chat.chatId} className='text-[12px]'>
                      <span className={isMe ? 'text-green-300' : 'text-sky-300'}>{chat.nickname}</span>
                      <span className='text-gray-300'>: {chat.message}</span>
                    </li>
                  )
                }
                return null
              })}
              <li ref={chatContainerRef} className='list-none h-[1px]'></li>
            </ul>

            {/* 입력 */}
            <FormikProvider value={formik}>
              <Form onSubmit={formik.handleSubmit}>
                <input
                  onFocus={() => setEnteredInput(false)}
                  onBlur={() => setEnteredInput(true)}
                  name='message'
                  placeholder={nickname === 'unknown' ? '닉네임을 먼저 설정하세요' : 'Enter로 전송'}
                  disabled={nickname === 'unknown'}
                  className='w-full text-white bg-[#ffffff11] h-[32px] px-[10px] text-[12px] outline-none border-t border-[#ffffff22] placeholder-gray-500 disabled:opacity-40'
                  type='text'
                  onChange={formik.handleChange}
                  value={formik.values.message}
                />
              </Form>
            </FormikProvider>
          </div>
        )}
      </div>
    </>
  )
}

export default Message
