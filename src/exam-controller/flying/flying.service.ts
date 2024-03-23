import { Injectable } from '@nestjs/common';
import { CreateFlyingDto } from './dto/create_flying.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlyingSquadDocument,
  FlyingSquad,
} from '../../schemas/flying-squad.schema';
import { Model } from 'mongoose';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { AssignRoomsDto } from './dto/assign-rooms.dto';

@Injectable()
export class FlyingService {
  constructor(
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async create(body: CreateFlyingDto) {
    const flyingSquad = new this.flyingSquadModel({
      teacher_id: body.teacher_id,
      slot: body.slot_id,
    });
    await flyingSquad.save();
    const slot = await this.slotModel.findById(body.slot_id);
    slot.flying_squad.push(flyingSquad._id.toString());
    await slot.save();
    return {
      message: 'Flying squad member added successfully',
    };
  }

  async assignRooms(body: AssignRoomsDto) {
    const flyingSquad = await this.flyingSquadModel.findById(
      body.flying_squad_id,
    );
    if (!flyingSquad) {
      return {
        message: 'Flying squad member not found',
      };
    }
    if ((flyingSquad.rooms_assigned.length as any) == 0) {
      flyingSquad.rooms_assigned = body.room_ids.map((room) => ({
        room_id: room,
        status: 'assigned',
      })) as any;
    } else {
      (flyingSquad.rooms_assigned as any) = [
        ...flyingSquad.rooms_assigned,
        ...(body.room_ids.map((room) => ({
          room_id: room,
          status: 'assigned',
        })) as any),
      ];
    }

    await flyingSquad.save();
    return {
      message: 'Rooms assigned successfully',
    };
  }

  async getBySlot(slot_id: string) {
    return await this.flyingSquadModel
      .find({ slot: slot_id })
      .populate('rooms_assigned.room_id', 'room_no')
      .populate('teacher_id', 'name sap_id email phone');
  }
}
