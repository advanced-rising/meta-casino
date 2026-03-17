// Socket.io 이벤트 상수 (서버와 동일하게 유지)
export const CONNECT_EVENT = 'room/connect'
export const CREATE_ROOM_REQUEST = 'room/create'
export const LIST_ROOM_DATA_REQUEST = 'room/list-room-data-request'
export const JOIN_ROOM = 'room/join'
export const LEAVE_ROOM = 'room/leave'
export const UPDATE_ROOM_LIST = 'room/update-room-list'
export const IN_ROOM_USER = 'room/in-room-user'
export const NEW_MESSAGE = 'room/new-message'
export const SEND_MESSAGE = 'room/send-message'

export interface IRoom {
  id: string
  roomNm: string
}
