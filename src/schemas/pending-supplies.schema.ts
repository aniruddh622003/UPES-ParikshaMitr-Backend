import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PendingSuppliesDocument = HydratedDocument<PendingSupplies>;

@Schema()
export class PendingSupplies {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  })
  room_id: string;

  @Prop({
    type: [
      {
        type: String,
        quantity: Number,
      },
    ],
  })
  pending_supplies: [
    {
      type: string;
      quantity: number;
    },
  ];
}

export const PendingSuppliesSchema =
  SchemaFactory.createForClass(PendingSupplies);
