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

  // TODO: Add UFM Details
  @Prop({
    default: [],
  })
  student: [
    {
      sap_id: number;
      roll_no: string;
      student_name: string;
      course: string;
      subject: string;
      subject_code: string;
      eligible: {
        type: string;
        enum: ['YES', 'F_HOLD', 'DEBARRED'];
        default: 'YES';
      };
    },
  ];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
