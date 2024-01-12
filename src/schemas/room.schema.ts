import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({
  timestamps: true,
})
export class Room {
  @Prop({
    required: true,
  })
  room_no: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomInvigilator',
    default: null,
  })
  room_invigilator_id: string | null;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
