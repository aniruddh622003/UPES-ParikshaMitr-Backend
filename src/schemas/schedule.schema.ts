import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({
  timestamps: true,
})
export class Schedule {
  @Prop()
  event_name: string;

  @Prop()
  event_description: string;

  @Prop()
  event_start_time: Date;

  @Prop()
  event_end_time: Date;

  @Prop()
  location: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Teacher',
  })
  participants: string[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
