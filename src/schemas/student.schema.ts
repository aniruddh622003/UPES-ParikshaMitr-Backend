import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sap_id: number;

  @Prop({ required: true, unique: true })
  sheet_id: number;

  @Prop()
  course_name: string;

}

export const StudentSchema = SchemaFactory.createForClass(Student);