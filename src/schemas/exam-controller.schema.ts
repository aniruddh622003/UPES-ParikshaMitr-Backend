import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExamControllerDocument = HydratedDocument<ExamController>;

@Schema()
export class ExamController {
  @Prop()
  name: string;

  @Prop()
  password: string;
}

export const ExamControllerSchema =
  SchemaFactory.createForClass(ExamController);
