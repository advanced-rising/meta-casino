"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEND_MESSAEGE = exports.NEW_MESSAGE = exports.IN_ROOM_USER = exports.UPDATE_ROOM_LIST = exports.LEAVE_ROOM = exports.JOIN_ROOM = exports.LIST_ROOM_DATA_REQUEST = exports.CREATE_ROOM_REQUEST = exports.CONNECT_EVENT = void 0;
const rooms_1 = require("../repository/rooms");
exports.CONNECT_EVENT = 'room/connect';
exports.CREATE_ROOM_REQUEST = 'room/create';
exports.LIST_ROOM_DATA_REQUEST = 'room/list-room-data-request';
exports.JOIN_ROOM = 'room/join';
exports.LEAVE_ROOM = 'room/reave';
exports.UPDATE_ROOM_LIST = 'room/update-room-list';
exports.IN_ROOM_USER = 'room/in-room-user';
exports.NEW_MESSAGE = 'room/new-message';
exports.SEND_MESSAEGE = 'room/send-message';
class SocketRoom {
    static listen(io, socket) {
        this.io = io;
        this.connect(socket);
        this.inRoomUserListener(socket);
    }
    /**
     * 최초 접속시
     */
    static connect(socket) {
        socket.emit(exports.CONNECT_EVENT, rooms_1.RoomsRepository.getRooms);
        this.creatRoomRequestListener(socket);
        this.joinRoomRequestListener(socket);
        this.leaveRoomRequestListener(socket);
        this.listRoomDataRequestListener(socket);
    }
    static listRoomDataRequestListener(socket) {
        socket.on(exports.LIST_ROOM_DATA_REQUEST, (ack) => {
            const rooms = rooms_1.RoomsRepository.getRooms;
            ack(rooms);
        });
    }
    static creatRoomRequestListener(socket) {
        socket.on(exports.CREATE_ROOM_REQUEST, (roomNm) => {
            const rooms = rooms_1.RoomsRepository.addRoom(roomNm);
            this.io.to('wating-room').emit(exports.UPDATE_ROOM_LIST, rooms);
        });
    }
    static joinRoomRequestListener(socket) {
        socket.on(exports.JOIN_ROOM, (roomId) => {
            socket.join(roomId);
        });
    }
    static leaveRoomRequestListener(socket) {
        socket.on(exports.LEAVE_ROOM, (roomId) => {
            socket.leave(roomId);
        });
    }
    static inRoomUserListener(socket) {
        socket.on(exports.IN_ROOM_USER, () => {
            socket.broadcast.emit(exports.IN_ROOM_USER, { id: socket.id });
        });
        socket.on(exports.SEND_MESSAEGE, (message) => {
            console.log(`[SERVER] send: ${message.message} to ${message.roomId}`);
            this.io.emit(exports.NEW_MESSAGE, {
                message: message.message,
                senderId: socket.id,
                chatId: message.chatId,
                nickname: message.nickname,
            });
        });
        socket.on('disconnect', socket.removeAllListeners);
        return () => {
            socket.off(exports.SEND_MESSAEGE, socket.removeAllListeners);
            socket.off(exports.NEW_MESSAGE, socket.removeAllListeners);
        };
    }
}
exports.default = SocketRoom;
