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

SocketRoom.listen(io)
SocketThree.three(io)

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
