import { Injectable,HttpException, Inject, Logger } from '@nestjs/common';
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
    try{
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
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async assignRooms(body: AssignRoomsDto) {
    try{
    const flyingSquad = await this.flyingSquadModel.findById(
      body.flying_squad_id,
    );
    flyingSquad.rooms_assigned = body.room_ids.map((room) => ({
      room_id: room,
      status: 'assigned',
    })) as any;
    await flyingSquad.save();
    return {
      message: 'Rooms assigned successfully',
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async getBySlot(slot_id: string) {
    try{
    return await this.flyingSquadModel
      .find({ slot: slot_id })
      .populate('rooms_assigned.room_id', 'room_no')
      .populate('teacher_id', 'name sap_id email phone');}catch (err) {
        if (err instanceof HttpException) {
          throw err;
        } else {
          throw new HttpException(err.message, 400);
        }
      }
  }
}
