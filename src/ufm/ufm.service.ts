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

    if (!student.attendance) {
      throw new HttpException('Can not mark UFM to absent students', 400);
    }

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
      exam_time: slot[0].timeSlot,
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
      student_remarks: body.student_remarks,
    });

    try {
      await ufm.save();
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    student.UFM = ufm._id.toString();
    student.UFM_by = teacher.id;

    if (body.new_sheet_number) {
      student.new_ans_sheet_number = body.new_sheet_number;
    }

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

  async getAllUFMs() {
    const slots = await this.slotModel
      .find({
        ufms: { $exists: true, $not: { $size: 0 } },
      })
      .populate({
        path: 'ufms',
      });

    const res = [];

    for (const slot of slots) {
      const r: any = {};
      r['slot'] = slot.toObject();
      for (const ufm of slot.ufms) {
        const room = await this.roomModel.findById((ufm as any).room, {
          students: {
            $elemMatch: { sap_id: (ufm as any).student.sap_id },
          },
          room_no: 1,
          room_invigilator_id: 1,
          block: 1,
        });
        if (!room) {
          throw new HttpException('Room not found', 404);
        }
        r.slot.ufms[slot.ufms.indexOf(ufm)].room = {
          room_no: room.room_no,
          block: room.block,
        };
        r.slot.ufms[slot.ufms.indexOf(ufm)].UFM_by =
          await this.teacherModel.findById(room.students[0].UFM_by, {
            name: 1,
            sap_id: 1,
            email: 1,
            phone: 1,
          });

        r.slot.ufms[slot.ufms.indexOf(ufm)].new_ans_sheet_number =
          room.students[0].new_ans_sheet_number;

        r.slot.ufms[slot.ufms.indexOf(ufm)].old_ans_sheet_number =
          room.students[0].ans_sheet_number;

        r.slot.ufms[slot.ufms.indexOf(ufm)].student = {
          ...r.slot.ufms[slot.ufms.indexOf(ufm)].student,
          roll_no: room.students[0].roll_no,
          course: room.students[0].course,
          exam_type: room.students[0].exam_type,
          subject: room.students[0].subject,
          subject_code: room.students[0].subject_code,
          seat_no: room.students[0].seat_no,
        };
      }
      res.push(r);
    }

    return res;
  }

  async getUFMBySlot(slot_id) {
    const slot = await this.slotModel.findById(slot_id).populate({
      path: 'ufms',
    });

    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    const r: any = {};
    r['slot'] = slot.toObject();
    for (const ufm of slot.ufms) {
      const room = await this.roomModel.findById((ufm as any).room, {
        students: {
          $elemMatch: { sap_id: (ufm as any).student.sap_id },
        },
        room_no: 1,
        room_invigilator_id: 1,
        block: 1,
      });
      if (!room) {
        throw new HttpException('Room not found', 404);
      }

      r.slot.ufms[slot.ufms.indexOf(ufm)].room = {
        room_no: room.room_no,
        block: room.block,
      };
      r.slot.ufms[slot.ufms.indexOf(ufm)].UFM_by =
        await this.teacherModel.findById(room.students[0].UFM_by, {
          name: 1,
          sap_id: 1,
          email: 1,
          phone: 1,
        });

      r.slot.ufms[slot.ufms.indexOf(ufm)].new_ans_sheet_number =
        room.students[0].new_ans_sheet_number;

      r.slot.ufms[slot.ufms.indexOf(ufm)].old_ans_sheet_number =
        room.students[0].ans_sheet_number;

      r.slot.ufms[slot.ufms.indexOf(ufm)].student = {
        ...r.slot.ufms[slot.ufms.indexOf(ufm)].student,
        roll_no: room.students[0].roll_no,
        course: room.students[0].course,
        exam_type: room.students[0].exam_type,
        subject: room.students[0].subject,
        subject_code: room.students[0].subject_code,
        seat_no: room.students[0].seat_no,
      };
    }

    return r;
  }

  async getUFMById(id) {
    const ufm = await this.ufmModel.findById(id);
    if (!ufm) {
      throw new HttpException('UFM not found', 404);
    }
    const room = await this.roomModel.findById(ufm.room, {
      students: {
        $elemMatch: { sap_id: ufm.student.sap_id },
      },
      room_no: 1,
      room_invigilator_id: 1,
      block: 1,
    });
    if (!room) {
      throw new HttpException('Room not found', 404);
    }
    const r: any = {};
    r['ufm'] = ufm.toObject();
    r.ufm.room = {
      room_no: room.room_no,
      block: room.block,
    };
    r.ufm.UFM_by = await this.teacherModel.findById(room.students[0].UFM_by, {
      name: 1,
      sap_id: 1,
      email: 1,
      phone: 1,
    });

    r.ufm.new_ans_sheet_number = room.students[0].new_ans_sheet_number;

    r.ufm.old_ans_sheet_number = room.students[0].ans_sheet_number;

    r.ufm.student = {
      ...r.ufm.student,
      roll_no: room.students[0].roll_no,
      course: room.students[0].course,
      exam_type: room.students[0].exam_type,
      subject: room.students[0].subject,
      subject_code: room.students[0].subject_code,
      seat_no: room.students[0].seat_no,
    };

    return r;
  }
}
