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
    _id: false,
    type: [
      {
        sap_id: Number,
        roll_no: String,
        student_name: String,
        course: String,
        subject: String,
        subject_code: String,
        seat_no: String,
        eligible: {
          type: String,
          enum: ['YES', 'F_HOLD', 'DEBARRED'],
          default: 'YES',
        },
      },
    ],
  })
  students: [
    {
      sap_id: number;
      roll_no: string;
      student_name: string;
      course: string;
      subject: string;
      subject_code: string;
      seat_no: string;
      eligible: {
        type: string;
        enum: ['YES', 'F_HOLD', 'DEBARRED'];
        default: 'YES';
      };
    },
  ];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
