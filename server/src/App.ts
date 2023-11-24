import http from 'http';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import { cryptoHelper } from '@lib/cryptoHelper';
import initModules from './initModules';
import SocketIOServer from './SocketIOServer';
import { createExpressRouters } from '@infra/interfaces/http';

// async handler 처리를 따로 안해줘도 됨
require('express-async-errors');

//TODO: 환경변수 반영하기
// const serviceAccount = require(path.resolve(__dirname, `../src/lib/firebase/adminsdk-prod.json`));

// require("ts-node").register();

export default class App {
  public async setup(): Promise<http.Server> {
    const app = express();

    // req.ip 에 ip 담아줌
    app.set('trust proxy', true);
    // post body 설정을 위한 body parser
    app.use(express.urlencoded({ limit: '50mb', extended: false }));
    app.use(express.json({ limit: '50mb' }));
    // 쿠키 파서를 세팅한다.
    app.use(cookieParser());

    // form data 파싱한다.
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
    app.use(compression());

    // CORS 세팅 해준다.

    app.use(
      cors({
        origin: ['http://localhost:3000'],
        optionsSuccessStatus: 200,
      }),
    );

    await this.initDB();
    // cryptoHelper.setup({ jwtSecret, bcryptRound: 5 });

    // swagger settings

    app.use(this.allowCookie);

    app.use(express.static(path.join(__dirname, './public')));

    const modules = await initModules();
    const routers = await createExpressRouters(modules);
    const server = http.createServer(app);

    const ioserver = new SocketIOServer(server, {});
    await ioserver.start();

    app.use('/', routers);

    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });

    // add error handler
    // app.use(domainErrHandler);

    return server;
  }

  private allowCookie(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  }

  private initDB = async () => {
    await setupSequelize();
  };
}
