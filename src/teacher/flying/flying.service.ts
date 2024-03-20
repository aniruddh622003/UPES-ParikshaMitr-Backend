import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlyingSquad,
  FlyingSquadDocument,
} from '../../schemas/flying-squad.schema';
import { Model } from 'mongoose';

@Injectable()
export class FlyingService {
  constructor(
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
  ) {}

  async getFlyingSquad(room_id: string) {
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
        teacher: {
          id: (data.teacher_id as any)?._id,
          name: (data.teacher_id as any)?.name,
          sap_id: (data.teacher_id as any)?.sap_id,
          email: (data.teacher_id as any)?.email,
          phone: (data.teacher_id as any)?.phone,
        },
        status: data.rooms_assigned.filter((room) => room.room_id == room_id)[0]
          ?.status,
      };
    });

    return {
      message: 'Flying squad member assigned to this room',
      flying_squad: res,
    };
  }
}
