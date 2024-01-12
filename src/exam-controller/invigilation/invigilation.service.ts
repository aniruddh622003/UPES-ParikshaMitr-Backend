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

  async getRoomWithApprovalPendingInvigilator() {
    const roomswithPendingInvigilator = await this.roomInvigilatorModel
      .find({
        $or: [
          {
            $and: [
              { invigilator1_controller_approval: false },
              {
                invigilator1_id: { $ne: null },
              },
            ],
          },
          {
            $and: [
              { invigilator2_controller_approval: false },
              {
                invigilator2_id: { $ne: null },
              },
            ],
          },
        ],
      })
      .populate('invigilator1_id')
      .populate('invigilator2_id')
      .populate('room_id');
    const returnObj = roomswithPendingInvigilator.map((room) => {
      const temp = {};
      temp['room'] = room.room_id;
      if (room.invigilator1_id) {
        temp['invigilator1'] = room.invigilator1_id;
      }
      if (room.invigilator2_id) {
        temp['invigilator2'] = room.invigilator2_id;
      }
      return temp;
    });
    return returnObj;
  }

  approveInvigilator(approveInvigilatorDto) {
    const room = this.roomModel.findById(approveInvigilatorDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }
  }
}
