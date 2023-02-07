import Koa from 'koa'
import http from 'http'
import next from 'next'

import { Server } from 'socket.io'
import SocketRoom from './handler/SocketRoom'
import SocketThree from './handler/SocketThree'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const koa = new Koa()
const server = http.createServer(koa.callback())

const io = new Server(server)
let clients = {}
const link = () => {
  io.on('connection', (socket) => {
    SocketRoom.listen(io, socket)
    console.log(`User ${socket.id} connected, there are currently ${io.engine.clientsCount} users connected`)

    //Add a new client indexed by his id
    clients[socket.id] = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    }
    console.log('back ~###############', clients)
    io.sockets.emit('move', clients)

    socket.on('move', ({ id, rotation, position }) => {
      clients[id].position = position
      clients[id].rotation = rotation

      io.sockets.emit('move', clients)
    })

    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected, there are currently ${io.engine.clientsCount} users connected`)

      //Delete this client from the object
      delete clients[socket.id]

      io.sockets.emit('move', clients)
    })
  })
}
// SocketThree.three(io)

const main = async () => {
  await app.prepare()

  // koa.use(logger());

  koa.use((ctx) => {
    return handle(ctx.req, ctx.res)
  })

  server.listen(port, () => {
    console.log(`Server Running At PORT: ${port}`)
  })
}

main()
link()
