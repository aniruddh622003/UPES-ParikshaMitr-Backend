import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoomInvigilatorDocument = HydratedDocument<RoomInvigilator>;

@Schema({
  timestamps: true,
})
export class RoomInvigilator {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rooms',
    required: true,
  })
  room_id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teachers',
    default: null,
  })
  invigilator1_id: string | null;

  @Prop({
    default: null,
  })
  invigilator1_assign_time: Date | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teachers',
    default: null,
  })
  invigilator2_id: string | null;

  @Prop({
    default: null,
  })
  invigilator2_assign_time: Date | null;
}
