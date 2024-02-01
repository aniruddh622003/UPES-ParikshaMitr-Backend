import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeacherDocument = HydratedDocument<Teacher>;

@Schema({
  timestamps: true,
})
export class Teacher {
  @Prop({ unique: true })
  sap_id: number;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  approved: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
