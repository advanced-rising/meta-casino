import { useEffect, useState, useMemo } from 'react'
import {
  JOIN_ROOM,
  LEAVE_ROOM,
  UPDATE_ROOM_LIST,
  CONNECT_EVENT,
  LIST_ROOM_DATA_REQUEST,
  IN_ROOM_USER,
  NEW_MESSAGE,
} from 'server/handler/SocketRoom'
import { IRoom } from 'server/repository/rooms'
import { Socket } from 'socket.io-client'
import { useImmer } from 'use-immer'

import { socket } from './context'

export const useJoinRoom = (socket: Socket, roomId: string) => {
  const requestJoin = () => {
    console.log(`join Room: ${roomId}`)
    socket.emit(JOIN_ROOM, roomId)

    return () => {
      console.log(`Leave Room: ${roomId}`)
      socket.emit(LEAVE_ROOM, roomId)
    }
  }

  useEffect(requestJoin, [])
}

export const useRoomsIo = (socket: Socket) => {
  const [rooms, setRooms] = useState<IRoom[]>([])
  const roomData = () => {
    console.log('userRoomsIo Mount')
    socket.on(CONNECT_EVENT, (rooms: IRoom[]) => {
      setRooms(rooms)
    })
    socket.on(UPDATE_ROOM_LIST, (rooms: IRoom[]) => {
      setRooms(rooms)
    })

    return () => {
      console.log('use room leave')
      socket.off(CONNECT_EVENT).off(UPDATE_ROOM_LIST)
    }
  }

  useEffect(roomData, [])
  return [rooms]
}

export const useWatingRoom = (socket: Socket) => {
  const ms = useMemo(() => socket, [socket])
  const [rooms, setRooms] = useState<IRoom[]>([])
  const roomData = () => {
    ms.emit(LIST_ROOM_DATA_REQUEST, (rooms: IRoom[]) => {
      setRooms(rooms)
    })

    ms.on(UPDATE_ROOM_LIST, (rooms: IRoom[]) => {
      setRooms(rooms)
    })
    return () => {
      ms.off(UPDATE_ROOM_LIST)
    }
  }

  useEffect(roomData, [])

  return { rooms }
}

export const useJoinNewUser = (socket: Socket) => {
  const ms = useMemo(() => socket, [socket])
  const [id, setId] = useImmer({
    id: '',
    nickname: '',
  })

  const newUserJoinListener = () => {
    ms.on(IN_ROOM_USER, ({ id, nickname }: any) => {
      setId((draft) => {
        draft.id = id
        draft.nickname = nickname
      })
      console.log(`newUserJoinListener: `, id, nickname)
    })

    return () => {
      ms.off(IN_ROOM_USER)
    }
  }

  useEffect(newUserJoinListener, [])

  return { id: id.id, nickname: id.nickname }
}

export const useNewMessage = () => {
  const [message, setMessage] = useState<{
    message: string
    senderId: string
    chatId: string
    nickname: string
  }>()

  useEffect(() => {
    socket.on(NEW_MESSAGE, (ack: { message: string; senderId: string; chatId: string; nickname: string }) => {
      setMessage(ack)
    })

    return () => {
      socket.off(NEW_MESSAGE)
    }
  }, [])

  return { message }
}
