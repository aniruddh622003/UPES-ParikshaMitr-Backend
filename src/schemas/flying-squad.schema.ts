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
    type: String,
    default: 'not started',
  })
  status: string;

  @Prop({
    type: Date,
    default: null,
  })
  in_time: Date;

  @Prop({
    type: Date,
    default: null,
  })
  out_time: Date;

  @Prop({
    type: String,
    default: '',
  })
  final_remarks: string;

  @Prop({
    type: [
      {
        room_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
          required: true,
        },
        status: String,
        room_remarks: {
          type: String,
          default: '',
        },
      },
    ],
    required: true,
    _id: false,
  })
  rooms_assigned: [
    {
      room_id: string;
      status: string;
      room_remarks: string;
    },
  ];
}

export const FlyingSquadSchema = SchemaFactory.createForClass(FlyingSquad);
