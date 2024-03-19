import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SlotDocument = HydratedDocument<Slot>;

@Schema({
  timestamps: true,
})
export class Slot {
  @Prop({ required: true })
  date: string;

  @Prop({
    required: true,
    type: String,
    enum: ['Morning', 'Evening', 'Afternoon'],
  })
  timeSlot: string;

  @Prop({ required: true, type: String, enum: ['Midsem', 'Endsem'] })
  type: string;

  @Prop({ required: true })
  uniqueCode: string;

  @Prop({ required: true, type: [mongoose.Schema.Types.ObjectId], ref: 'Room' })
  rooms: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'UFM', default: [] })
  ufms: string[];

  @Prop({
    required: true,
    type: [
      {
        name: String,
        phone: String,
      },
    ],
    default: [],
  })
  contact: [
    {
      name: string;
      phone: string;
    },
  ];

  @Prop({ default: true })
  isDeletable: boolean;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'FlyingSquad',
    default: [],
  })
  flying_squad: string[];
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
