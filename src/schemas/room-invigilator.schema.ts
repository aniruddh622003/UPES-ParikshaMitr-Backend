import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RoomInvigilatorDocument = HydratedDocument<RoomInvigilator>;

@Schema()
export class RoomInvigilator {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  })
  room_id: string | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null,
  })
  invigilator1_id: string | null;

  @Prop({
    default: null,
  })
  invigilator1_assign_time: Date | null;

  @Prop({
    default: false,
  })
  invigilator1_teacher_approval: boolean;

  @Prop({
    default: false,
  })
  invigilator1_controller_approval: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamController',
    default: null,
  })
  invigilator1_controller_approved_by: string | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null,
  })
  invigilator2_id: string | null;

  @Prop({
    default: null,
  })
  invigilator2_assign_time: Date | null;

  @Prop({
    default: false,
  })
  invigilator2_teacher_approval: boolean;

  @Prop({
    default: false,
  })
  invigilator2_controller_approval: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamController',
    default: null,
  })
  invigilator2_controller_approved_by: string | null;
}

export const RoomInvigilatorSchema =
  SchemaFactory.createForClass(RoomInvigilator);
