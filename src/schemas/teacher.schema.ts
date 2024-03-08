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

  @Prop({
    validate: {
      validator: function (v: number) {
        return v.toString().length === 10;
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  })
  phone: number;

  @Prop({
    validate: {
      validator: function (v: string) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  })
  email: string;

  @Prop({ default: false })
  approved: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
