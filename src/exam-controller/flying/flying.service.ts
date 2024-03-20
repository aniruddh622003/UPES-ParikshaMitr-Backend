import { Injectable } from '@nestjs/common';
import { CreateFlyingDto } from './dto/create_flying.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlyingSquadDocument,
  FlyingSquad,
} from '../../schemas/flying-squad.schema';
import { Model } from 'mongoose';
import { Slot, SlotDocument } from '../../schemas/slot.schema';

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
}
