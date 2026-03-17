import { Server, Socket } from 'socket.io'

export const THREE_CONNECT_EVENT = 'three/connect'
let clients: Record<string, { position: number[]; rotation: number[]; nickname: string }> = {}

class SocketThree {
  private static io: Server

  public static listen(io: Server, socket: Socket) {
    this.io = io
    console.log(`User ${socket.id} connected, there are currently ${this.io.engine.clientsCount} users connected`)

    // Add new client
    clients[socket.id] = {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      nickname: '',
    }

    // Send current clients state to newly connected user
    socket.emit('move', clients)

    // Broadcast updated clients to everyone
    socket.broadcast.emit('move', clients)

    // Listen for move events
    socket.on('move', (data: { id: string; position: number[]; rotation: number[]; nickname: string }) => {
      if (clients[data.id]) {
        clients[data.id].position = data.position
        clients[data.id].rotation = data.rotation
        if (data.nickname) {
          clients[data.id].nickname = data.nickname
        }
      }
      this.io.sockets.emit('move', clients)
    })

    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected, there are currently ${this.io.engine.clientsCount} users connected`)
      delete clients[socket.id]
      this.io.sockets.emit('move', clients)
    })
  }
}

export default SocketThree
