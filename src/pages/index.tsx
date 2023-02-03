import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import Link from 'next/link'
import { useJoinRoom, useWatingRoom } from '../utils/hook'
import { CREATE_ROOM_REQUEST } from '../../server/handler/SocketRoom'
import { IRoom } from '../../server/repository/rooms'
import { socket } from '../utils/context'
import { useCallback, useEffect, useState } from 'react'
import { useFormik, FormikProvider, Form } from 'formik'
import * as Yup from 'yup'
import { useImmer } from 'use-immer'
import { useRouter } from 'next/router'

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
  console.log('rooms', rooms)
  const [formData, setFormData] = useImmer({
    nickname: '',
  })

  const formik = useFormik({
    initialValues: {
      nickname: '',
    },
    validationSchema: Yup.object({
      nickname: Yup.string().required(),
    }),
    onSubmit: async (values, fn) => {
      setFormData((draft) => {
        draft.nickname = values.nickname
      })
      fn.resetForm()
      fn.setFieldValue('nickname', '')
    },
  })

  const roomFormik = useFormik({
    initialValues: {
      roomName: '',
    },
    validationSchema: Yup.object({
      roomName: Yup.string().required(),
    }),
    onSubmit: async (values, fn) => {
      if (values.roomName || values.roomName !== '') {
        if (rooms.filter((room) => values.roomName === room.roomNm).length > 0) {
          alert('해당 방 이름은 이미 존재합니다.')
          return
        }
      }
      if (values.roomName || values.roomName !== '') {
        socket.emit(CREATE_ROOM_REQUEST, values.roomName)
      }

      fn.resetForm()
      fn.setFieldValue('roomName', '')
    },
  })

  const handleUserKeyPress = useCallback((event) => {
    const { key, keyCode } = event

    if (keyCode === 13 || key === 'Enter') {
      if (formik.values.nickname.length > 0 && roomFormik.values.roomName.length > 0) {
        formik.handleSubmit()
        roomFormik.handleSubmit()
        return
      }
      if (formik.values.nickname.length > 0) {
        return formik.handleSubmit()
      }
      if (roomFormik.values.roomName.length > 0) {
        return roomFormik.handleSubmit()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress)
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress)
    }
  }, [handleUserKeyPress])

  return (
    <div className='w-full'>
      <FormikProvider value={formik}>
        <Form onSubmit={formik.handleSubmit} className='w-full'>
          {formData.nickname ? (
            <p>{formData.nickname}</p>
          ) : (
            <input
              className='w-full text-[#000000] h-[40px] placeholder:text-[#dddddd] px-[20px]'
              name='nickname'
              type='text'
              onChange={formik.handleChange}
              value={formik.values.nickname}
              placeholder='닉네임'
            />
          )}
        </Form>
      </FormikProvider>
      <FormikProvider value={roomFormik}>
        <Form onSubmit={roomFormik.handleSubmit} className='w-full'>
          <input
            className='w-full text-[#000000] h-[40px] placeholder:text-[#dddddd] px-[20px]'
            name='roomName'
            type='text'
            onChange={roomFormik.handleChange}
            value={roomFormik.values.roomName}
            placeholder='방 이름을 적어주세요'
          />
        </Form>
      </FormikProvider>
      <ul className='flex flex-col w-full p-[40px] gap-[20px]'>
        {rooms.map((room: IRoom) => (
          <li key={room.id} className='text-2xl text-white'>
            <button
              onClick={() => {
                if (!formData.nickname) {
                  alert('닉네임을 정해주세요.')
                } else {
                  router.push(
                    {
                      pathname: `/room/${room.roomNm}`,
                      query: { roomNm: room.roomNm, nickname: formData.nickname },
                    },
                    `/room/${room.roomNm}`,
                  )
                }
              }}>
              {room.roomNm}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = (props) => {
  return <Logo scale={0.5} route='/blob' position-y={-1} />
}

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}
