import { Server, Socket } from 'socket.io'

export const THREE_CONNECT_EVENT = 'three/connect'
let clients = {}

class SocketThree {
  private static io: Server

  public static listen(io: Server, socket: Socket) {
    this.io = io
    this.connect(socket)
  }

  public static connect(socket: Socket) {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.id} connected, there are currently ${this.io.engine.clientsCount} users connected`)
      this.inTheThreeChar(socket)
    })
  }

  public static inTheThreeChar(socket: Socket) {
    // Socket app msgs

    //Add a new client indexed by his id
    clients[socket.id] = {
      position: [0, 0, 0],
    }
    this.io.sockets.emit('move', clients)
    socket.on('move', ({ id, position }) => {
      clients[id].position = position
      this.io.sockets.emit('move', clients)
    })
    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected, there are currently ${this.io.engine.clientsCount} users connected`)

      //Delete this client from the object
      delete clients[socket.id]

      this.io.sockets.emit('move', clients)
    })
  }
}

export default SocketThree
