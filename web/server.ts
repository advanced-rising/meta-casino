import http from 'http'
import next from 'next'
import { Server } from 'socket.io'
import SocketRoom from './server-handler/SocketRoom'
import SocketThree from './server-handler/SocketThree'

const port = parseInt(process.env.PORT || '6100', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server)

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`)
    SocketRoom.listen(io, socket)
    SocketThree.listen(io, socket)

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
