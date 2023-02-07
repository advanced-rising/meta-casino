import { Server, Socket } from 'socket.io'

export const THREE_CONNECT_EVENT = 'three/connect'
let clients = {}

class SocketThree {
  private static io: Server

  public static three(io: Server) {
    this.io = io
    this.inTheThreeChar()
  }

  public static inTheThreeChar() {
    // Socket app msgs
    this.io.on('connection', (client) => {
      console.log(`User ${client.id} connected, there are currently ${this.io.engine.clientsCount} users connected`)

      //Add a new client indexed by his id
      clients[client.id] = {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }

      this.io.sockets.emit('move', clients)

      client.on('move', ({ id, rotation, position }) => {
        clients[id].position = position
        clients[id].rotation = rotation

        this.io.sockets.emit('move', clients)
      })

      client.on('disconnect', () => {
        console.log(
          `User ${client.id} disconnected, there are currently ${this.io.engine.clientsCount} users connected`,
        )

        //Delete this client from the object
        delete clients[client.id]

        this.io.sockets.emit('move', clients)
      })
    })
  }
}

export default SocketThree
