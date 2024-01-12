import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { Model } from 'mongoose';

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    const room = new this.roomModel({
      room_no: createRoomDto.roomNo,
    });

    const room_id = room._id;
    const roomInvigilator = new this.roomInvigilatorModel({
      room_id,
    });
    room.room_invigilator_id = roomInvigilator._id.toString();

    await room.save();
    await roomInvigilator.save();

    return {
      message: `Created Room No: ${room.room_no}, ID: ${room._id}`,
    };
  }
}
