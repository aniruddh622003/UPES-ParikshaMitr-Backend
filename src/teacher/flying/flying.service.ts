import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlyingSquad,
  FlyingSquadDocument,
} from '../../schemas/flying-squad.schema';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { RequestVisitDto } from './dto/request-visit.dto';
import { FinishDutyDto } from './dto/finish-duty.dto';

@Injectable()
export class FlyingService {
  constructor(
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
  ) {}

  async getFlyingSquad(room_id: string) {
    try{
    const flying_data = await this.flyingSquadModel
      .find({
        'rooms_assigned.room_id': room_id,
      })
      .populate('teacher_id');

    if (!flying_data) {
      return {
        message: 'No flying squad member assigned to this room',
      };
    }

    const res = flying_data.map((data) => {
      return {
        _id: data._id,
        teacher: {
          id: (data.teacher_id as any)?._id,
          name: (data.teacher_id as any)?.name,
          sap_id: (data.teacher_id as any)?.sap_id,
          email: (data.teacher_id as any)?.email,
          phone: (data.teacher_id as any)?.phone,
        },
        status: data.rooms_assigned?.filter(
          (room) => room.room_id == room_id,
        )[0]?.status,
      };
    });

    return {
      message: 'Flying squad member assigned to this room',
      flying_squad: res,
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async getInvforRoom(room_id: string) {
    try{
    const invigilators = await this.roomInvigilatorModel
      .findOne({
        room_id: room_id,
      })
      .populate(
        'invigilator1_id invigilator2_id invigilator3_id',
        'name sap_id email phone',
      );

    const res = {
      invigilator1: invigilators.invigilator1_id,
      invigilator2: invigilators.invigilator2_id,
      invigilator3: invigilators.invigilator3_id,
    };

    return {
      message: 'Flying squad member assigned to this room',
      invigilators: res,
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async getRooms(teacher_id, slot_id) {
    try{
    const flying_data = await this.flyingSquadModel
      .findOne({
        teacher_id: teacher_id,
        slot: slot_id,
      })
      .populate('rooms_assigned.room_id', 'room_no');

    if (!flying_data) {
      throw new HttpException('Invalid Details', 400);
    }

    const rooms = flying_data.rooms_assigned.map((room) => {
      return {
        room_id: (room.room_id as any)?._id,
        room_no: (room.room_id as any)?.room_no,
        status: room.status,
      };
    });

    return {
      message: 'Rooms fetched successfully',
      rooms: rooms,
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async requestVisit(teacher_id: string, body: RequestVisitDto) {
    try{
    const flying_data = await this.flyingSquadModel.findOne({
      teacher_id: teacher_id,
      slot: body.slot_id,
    });

    if (!flying_data) {
      throw new HttpException('Invalid Details', 400);
    }

    const room = flying_data.rooms_assigned.filter(
      (room) => room.room_id == body.room_id,
    )[0];

    if (!room) {
      throw new HttpException('Invalid Room ID', 400);
    }

    room.room_remarks = body.room_remarks;
    room.status = 'requested';

    await flying_data.save();

    return {
      message: 'Visit requested successfully',
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async finishDuty(teacher_id: string, body: FinishDutyDto) {
    try{
    const flying_data = await this.flyingSquadModel
      .findOne({
        teacher_id: teacher_id,
        slot: body.slot_id,
      })
      .populate('rooms_assigned.room_id');

    if (!flying_data) {
      throw new HttpException('Invalid Details', 400);
    }

    flying_data.rooms_assigned.forEach((room) => {
      if (room.status !== 'approved') {
        throw new HttpException(
          'All rooms are not approved. Room No ' +
            (room.room_id as any).room_no +
            ' is not approved.',
          400,
        );
      }
    });

    flying_data.out_time = new Date();
    flying_data.final_remarks = body.final_remarks;
    flying_data.status = 'completed';

    await flying_data.save();

    return {
      message: 'Duty finished successfully',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
  }
}
