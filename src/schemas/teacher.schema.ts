import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeacherDocument = HydratedDocument<Teacher>;

@Schema({
  timestamps: true,
})
export class Teacher {
  @Prop()
  sap_id: number;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  approved: boolean;
}
