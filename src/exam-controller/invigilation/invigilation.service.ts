import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { Model } from 'mongoose';
import { ApproveInvigilatorDto } from './dto/approve-invigilator.dto';
import { CreateSeatingPlanDto } from './dto/create-seating-plan.dto';

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

  async approveInvigilator(approveInvigilatorDto: ApproveInvigilatorDto) {
    const room = await this.roomModel.findById(approveInvigilatorDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const roomInvigilator = await this.roomInvigilatorModel.findById(
      room.room_invigilator_id,
    );

    let approvedInvigilator;

    if (
      roomInvigilator.invigilator1_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator1_controller_approval = true;
      roomInvigilator.invigilator1_controller_approved_by =
        approveInvigilatorDto.controllerId;
      await roomInvigilator.populate('invigilator1_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator1_id;
    } else if (
      roomInvigilator.invigilator2_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator2_controller_approval = true;
      roomInvigilator.invigilator2_controller_approved_by =
        approveInvigilatorDto.controllerId;
      await roomInvigilator.populate('invigilator2_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator2_id;
    } else {
      throw new HttpException('Bad request', 400);
    }

    await roomInvigilator.save();

    // delete password field from approved invigilator
    delete approvedInvigilator.password;

    return {
      message: 'Invigilator approved',
      data: {
        invigilator: approvedInvigilator,
      },
    };
  }

  createSeatingPlan(body: CreateSeatingPlanDto) {
    return {
      message: 'Seating plan created',
      data: {
        room: body.room_id,
        seating_plan: body.seating_plan,
      },
    };
  }
}
