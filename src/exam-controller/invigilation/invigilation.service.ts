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
import { EditStudentEligibilityDto } from './dto/edit-student-eligibility.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { AddRoomToSlotDto } from './dto/add-room-to-slot.sto';

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async getSlots() {
    return await this.slotModel.find();
  }

  async getSlot(id: string) {
    return (await this.slotModel.findById(id)).populate('rooms ufms');
  }

  async createRoom(createRoomDto: CreateRoomDto) {
    const room = new this.roomModel({
      room_no: createRoomDto.roomNo,
      block: createRoomDto.block,
      floor: createRoomDto.floor,
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

  async approveInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    controllerId: string,
  ) {
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
      roomInvigilator.invigilator1_controller_approved_by = controllerId;
      await roomInvigilator.populate('invigilator1_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator1_id;
    } else if (
      roomInvigilator.invigilator2_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator2_controller_approval = true;
      roomInvigilator.invigilator2_controller_approved_by = controllerId;
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

  async createSeatingPlan(body: CreateSeatingPlanDto) {
    const roomDoc = await this.roomModel.findById(body.room_id);
    if (!roomDoc) {
      throw new HttpException('Room not found', 404);
    }

    roomDoc.students = body.seating_plan as any;
    try {
      await roomDoc.save({
        validateBeforeSave: true,
      });
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    return {
      message: 'Seating plan updated',
    };
  }

  async editStudentEligibility(body: EditStudentEligibilityDto) {
    const roomDoc = await this.roomModel.findById(body.room_id);
    if (!roomDoc) {
      throw new HttpException('Room not found', 404);
    }

    const stIdx = roomDoc.students.findIndex((st) => st.sap_id === body.sap_id);
    if (stIdx === -1) {
      throw new HttpException('Student not found', 404);
    }

    roomDoc.students[stIdx].eligible = body.eligible as any;

    try {
      await roomDoc.save({
        validateBeforeSave: true,
      });
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    return {
      message: 'Student eligibility updated',
    };
  }

  async createSlot(body: CreateSlotDto) {
    const slotExists = await this.slotModel.findOne({
      date: new Date(body.date).toISOString().split('T')[0],
      timeSlot: body.timeSlot,
    });
    if (slotExists) {
      throw new HttpException('Slot already exists', 409);
    }
    // Random alphanumeric code 10 characters long
    const randomCode = Math.random().toString(36).substr(2, 10);

    const slot = new this.slotModel({
      ...body,
      date: new Date(body.date).toISOString().split('T')[0],
      uniqueCode: randomCode,
    });
    return await slot.save();
  }

  async addRoomToSlot(body: AddRoomToSlotDto) {
    const slot = await this.slotModel.findById(body.slotId);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    (slot.rooms as any).addToSet(...body.roomIds);
    await slot.save();

    return {
      message:
        'Rooms added to slot, Date: ' + slot.date + ', Time: ' + slot.timeSlot,
    };
  }
}
