import { RoomsRepository } from './rooms'
import { Socket, Server } from 'socket.io'

export const CONNECT_EVENT = 'room/connect'
export const CREATE_ROOM_REQUEST = 'room/create'
export const LIST_ROOM_DATA_REQUEST = 'room/list-room-data-request'
export const JOIN_ROOM = 'room/join'
export const LEAVE_ROOM = 'room/leave'
export const UPDATE_ROOM_LIST = 'room/update-room-list'
export const IN_ROOM_USER = 'room/in-room-user'
export const NEW_MESSAGE = 'room/new-message'
export const SEND_MESSAGE = 'room/send-message'

class SocketRoom {
  private static io: Server

  public static listen(io: Server, socket: Socket) {
    this.io = io

    // 최초 접속 시 방 목록 전송
    socket.emit(CONNECT_EVENT, RoomsRepository.getRooms)

    // 방 목록 요청
    socket.on(LIST_ROOM_DATA_REQUEST, (ack: Function) => {
      ack(RoomsRepository.getRooms)
    })

    // 방 생성
    socket.on(CREATE_ROOM_REQUEST, (roomNm: string) => {
      const rooms = RoomsRepository.addRoom(roomNm)
      this.io.to('wating-room').emit(UPDATE_ROOM_LIST, rooms)
    })

    // 방 입장
    socket.on(JOIN_ROOM, (roomId: string) => {
      socket.join(roomId)
    })

    // 방 퇴장
    socket.on(LEAVE_ROOM, (roomId: string) => {
      socket.leave(roomId)
    })

    // 유저 입장 알림
    socket.on(IN_ROOM_USER, ({ nickname }: { nickname: string }) => {
      socket.broadcast.emit(IN_ROOM_USER, { id: socket.id, nickname })
    })

    // 채팅 메시지
    socket.on(SEND_MESSAGE, (message: { roomId: string; message: string; chatId: string; nickname: string }) => {
      console.log(`[Chat] ${message.nickname}: ${message.message}`)
      this.io.emit(NEW_MESSAGE, {
        message: message.message,
        senderId: socket.id,
        chatId: message.chatId,
        nickname: message.nickname,
      })
    })
  }
}

export default SocketRoom
