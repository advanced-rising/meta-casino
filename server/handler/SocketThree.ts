import { Server, Socket } from 'socket.io'

export const THREE_CONNECT_EVENT = 'three/connect'
let clients = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
}
class SocketThree {
  private static io: Server

  public static three(io: Server) {
    this.io = io
    this.inTheThreeChar()
  }

  public static inTheThreeChar() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.id} connected, there are currently ${this.io.engine.clientsCount} users connected`)

      //Add a new client indexed by his id
      socket[socket.id] = {
        id: socket.id,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }

      this.io.sockets.emit('move', clients)

      socket.on('move', ({ id, rotation, position }) => {
        clients[socket.id].id = socket.id
        clients[socket.id].position = position
        clients[socket.id].rotation = rotation

        this.io.sockets.emit('move', clients)
      })

      socket.on('disconnect', () => {
        console.log(
          `User ${socket.id} disconnected, there are currently ${this.io.engine.clientsCount} users connected`,
        )

        //Delete this client from the object
        delete clients[socket.id]

        this.io.sockets.emit('move', clients)
      })
    })
  }
}

export default SocketThree
