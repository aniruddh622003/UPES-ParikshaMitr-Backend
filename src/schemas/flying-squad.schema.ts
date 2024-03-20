import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FlyingSquadDocument = HydratedDocument<FlyingSquad>;

@Schema({
  timestamps: true,
})
export class FlyingSquad {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  })
  teacher_id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  })
  slot: string;

  @Prop({
    type: [
      {
        room_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
          required: true,
        },
        status: String,
      },
    ],
    required: true,
  })
  rooms_assigned: [
    {
      room_id: string;
      status: string;
    },
  ];
}

export const FlyingSquadSchema = SchemaFactory.createForClass(FlyingSquad);
