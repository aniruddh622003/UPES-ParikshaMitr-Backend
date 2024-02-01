import { HttpException, Injectable } from '@nestjs/common';
import { MarkUFMDto } from './dto/mark_ufm.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../schemas/room.schema';
import { UFM, UFMDocument } from '../schemas/ufm.schema';
import { Model } from 'mongoose';
import { RoomInvigilatorDocument } from '../schemas/room-invigilator.schema';
import { Teacher, TeacherDocument } from '../schemas/teacher.schema';
import { Slot, SlotDocument } from '../schemas/slot.schema';

@Injectable()
export class UfmService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(UFM.name) private ufmModel: Model<UFMDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async markUfm(body: MarkUFMDto, teacher: any) {
    const room = await this.roomModel
      .findById(body.room_id)
      .populate('room_invigilator_id', 'invigilator1_id invigilator2_id');
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const slot = await this.slotModel.find({
      rooms: body.room_id,
    });

    const checkTeacher = await this.teacherModel.findById(teacher.id);
    if (!checkTeacher) {
      throw new HttpException('Teacher not found', 404);
    }

    const studentIdx = room.students.findIndex(
      (student) => student.sap_id === parseInt(body.sap_id),
    );

    if (studentIdx === -1) {
      throw new HttpException('Student not found', 404);
    }

    const student = room.students[studentIdx];

    if (student.UFM) {
      throw new HttpException('Student already marked UFM', 400);
    }

    const ufm = new this.ufmModel({
      exam_type: student.exam_type,
      subject: {
        subject_code: student.subject_code,
        subject_name: student.subject,
      },
      course: student.course,
      exam_date: slot[0].date,
      exam_time: slot[0].timeSlot == 'Morning' ? '10:00 AM' : '2:00 PM',
      room: body.room_id,
      student: {
        name: student.student_name,
        sap_id: student.sap_id,
        father_name: body.father_name,
        address: body.address,
        mobile: body.mobile,
        emergency_contact: body.emergency_contact,
      },
      incriminating_material: body.incriminating_material,
      recovered_from: body.recovered_from,
      other_mode_of_misconduct: body.other_mode_of_misconduct,
    });

    try {
      await ufm.save();
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    student.UFM = ufm._id.toString();
    student.UFM_by = teacher.id;

    try {
      await room.save();
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    (slot[0].ufms as any).addToSet(ufm._id.toString());

    try {
      await slot[0].save();
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    return ufm;
  }
}
