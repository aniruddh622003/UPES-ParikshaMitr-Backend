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
        suppl_type: String,
        quantity: Number,
      },
    ],
    _id: false,
  })
  pending_supplies: [
    {
      suppl_type: string;
      quantity: number;
    },
  ];
}

export const PendingSuppliesSchema =
  SchemaFactory.createForClass(PendingSupplies);
