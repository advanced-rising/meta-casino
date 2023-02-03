"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const SocketRoom_1 = __importDefault(require("./handler/SocketRoom"));
const SocketThree_1 = __importDefault(require("./handler/SocketThree"));
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const koa = new koa_1.default();
const server = http_1.default.createServer(koa.callback());
const io = new socket_io_1.Server(server);
SocketRoom_1.default.listen(io);
SocketThree_1.default.three(io);
const main = async () => {
    await app.prepare();
    // koa.use(logger());
    koa.use((ctx) => {
        return handle(ctx.req, ctx.res);
    });
    server.listen(port, () => {
        console.log(`Server Running At PORT: ${port}`);
    });
};
main();
