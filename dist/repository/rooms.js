"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsRepository = void 0;
const uuid_1 = require("uuid");
class RoomsRepository {
    static get getRooms() {
        return this.rooms;
    }
    static addRoom(roomNm) {
        this.rooms = this.rooms.concat({ roomNm, id: (0, uuid_1.v4)() });
        return this.rooms;
    }
}
exports.RoomsRepository = RoomsRepository;
RoomsRepository.rooms = [];
