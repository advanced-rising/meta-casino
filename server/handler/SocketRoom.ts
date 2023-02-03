import { RoomsRepository } from '../repository/rooms'
import { v4 as uuid } from 'uuid'
import { Socket, Server } from 'socket.io'

export const CONNECT_EVENT = 'room/connect'
export const CREATE_ROOM_REQUEST = 'room/create'
export const LIST_ROOM_DATA_REQUEST = 'room/list-room-data-request'
export const JOIN_ROOM = 'room/join'
export const LEAVE_ROOM = 'room/reave'
export const UPDATE_ROOM_LIST = 'room/update-room-list'
export const IN_ROOM_USER = 'room/in-room-user'
export const NEW_MESSAGE = 'room/new-message'
export const SEND_MESSAEGE = 'room/send-message'

class SocketRoom {
  private static io: Server

  public static listen(io: Server, socket: Socket) {
    this.io = io

    this.connect(socket)
    this.inRoomUserListener(socket)
  }

  /**
   * 최초 접속시
   */
  public static connect(socket) {
    socket.emit(CONNECT_EVENT, RoomsRepository.getRooms)
    this.creatRoomRequestListener(socket)
    this.joinRoomRequestListener(socket)
    this.leaveRoomRequestListener(socket)
    this.listRoomDataRequestListener(socket)
  }

  public static listRoomDataRequestListener(socket: Socket) {
    socket.on(LIST_ROOM_DATA_REQUEST, (ack: Function) => {
      const rooms = RoomsRepository.getRooms
      ack(rooms)
    })
  }

  public static creatRoomRequestListener(socket: Socket) {
    socket.on(CREATE_ROOM_REQUEST, (roomNm: string) => {
      const rooms = RoomsRepository.addRoom(roomNm)
      this.io.to('wating-room').emit(UPDATE_ROOM_LIST, rooms)
    })
  }

  public static joinRoomRequestListener(socket: Socket) {
    socket.on(JOIN_ROOM, (roomId) => {
      socket.join(roomId)
    })
  }

  public static leaveRoomRequestListener(socket: Socket) {
    socket.on(LEAVE_ROOM, (roomId) => {
      socket.leave(roomId)
    })
  }

  public static inRoomUserListener(socket: Socket) {
    socket.on(IN_ROOM_USER, () => {
      socket.broadcast.emit(IN_ROOM_USER, { id: socket.id })
    })

    socket.on(SEND_MESSAEGE, (message: { roomId: string; message: string }) => {
      console.log(`[SERVER] send: ${message.message} to ${message.roomId}`)
      this.io.emit(NEW_MESSAGE, {
        message: message.message,
        senderId: socket.id,
        chatId: uuid(),
      })
    })
    socket.on('disconnect', socket.removeAllListeners)
    return () => {
      socket.off(SEND_MESSAEGE, socket.removeAllListeners)
      socket.off(NEW_MESSAGE, socket.removeAllListeners)
    }
  }
}

export default SocketRoom
