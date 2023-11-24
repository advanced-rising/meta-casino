import http from 'http';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { cryptoHelper } from '@lib/cryptoHelper';
import { Server } from 'socket.io';

export default class SocketIOServer {
  private io: Server;
  constructor(
    server: http.Server,

    private modules: {},
  ) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      },
      //  you can't have a sticky session with polling or overly complex
      transports: ['websocket'],
    });
  }

  public async start() {}
}
