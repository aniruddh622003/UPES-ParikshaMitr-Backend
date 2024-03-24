import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UFMDocument = HydratedDocument<UFM>;

@Schema({
  timestamps: true,
})
export class UFM {
  @Prop({
    required: true,
  })
  exam_type: string;

  @Prop({
    required: true,
    type: {
      subject_code: String,
      subject_name: String,
    },
    _id: false,
  })
  subject: {
    subject_code: string;
    subject_name: string;
  };

  @Prop({
    required: true,
  })
  course: string;

  @Prop({
    required: true,
  })
  exam_date: string;

  @Prop({
    required: true,
  })
  exam_time: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  })
  room: string;

  @Prop({
    required: true,
    type: {
      name: String,
      sap_id: Number,
      father_name: String,
      address: String,
      mobile: Number,
      emergency_contact: Number,
    },
    _id: false,
  })
  student: {
    name: string;
    sap_id: number;
    father_name: string;
    address: string;
    mobile: number;
    emergency_contact: number;
  };

  @Prop({
    required: true,
    type: {
      printed_pages: Number,
      handwritten_pages: Number,
      communication_devices: Number,
      torn_book_pages: Number,
    },
    _id: false,
  })
  incriminating_material: {
    printed_pages: number;
    handwritten_pages: number;
    communication_devices: number;
    torn_book_pages: number;
  };

  @Prop({
    required: true,
    type: {
      student_hand: Boolean,
      student_pocket: Boolean,
      student_shoe: Boolean,
      student_underclothes: Boolean,
      on_table: Boolean,
      in_answer_book: Boolean,
      under_answer_book: Boolean,
      under_question_paper: Boolean,
      under_feet: Boolean,
      in_desk: Boolean,
      near_desk: Boolean,
      other: Boolean,
    },
    _id: false,
  })
  recovered_from: {
    student_hand: boolean;
    student_pocket: boolean;
    student_shoe: boolean;
    student_underclothes: boolean;
    on_table: boolean;
    in_answer_book: boolean;
    under_answer_book: boolean;
    under_question_paper: boolean;
    under_feet: boolean;
    in_desk: boolean;
    near_desk: boolean;
    other: boolean;
  };

  @Prop({
    default: '',
  })
  other_mode_of_misconduct: string;

  @Prop({
    default: '',
  })
  student_remarks: string;
}

export const UFMSchema = SchemaFactory.createForClass(UFM);
