import io, { Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ''

let socket: Socket

if (typeof window !== 'undefined') {
  socket = SOCKET_URL ? io(SOCKET_URL) : io({ autoConnect: false })
} else {
  // SSR: 더미 객체
  socket = {} as Socket
}

export { socket }
