import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from '../../schemas/schedule.schema';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';

@Injectable()
export class ContTeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  async findApproved() {
    const teachers = await this.teacherModel.find({
      approved: true,
    });

    return teachers.map((teacher) => ({
      _id: teacher._id,
      sap_id: teacher.sap_id,
      name: teacher.name,
      approved: teacher.approved,
      onboardedAt: (teacher as any).createdAt,
    }));
  }

  async findUnapprovedTeachers() {
    const teachers = await this.teacherModel.find({ approved: false });

    //everything except the password
    return teachers.map((teacher) => ({
      _id: teacher._id,
      sap_id: teacher.sap_id,
      name: teacher.name,
      onboardedAt: (teacher as any).createdAt,
    }));
  }

  async approveTeacher(id: string) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        return {
          message: 'Teacher not found',
        };
      }
      if (teacher.approved) {
        return {
          message: 'Teacher already approved',
        };
      }
      teacher.approved = true;
      teacher.save();
      return {
        message: 'Teacher approved successfully',
        data: {
          name: teacher.name,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async disableTeacher(id: string) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        return {
          message: 'Teacher not found',
        };
      }
      if (!teacher.approved) {
        return {
          message: 'Teacher already disabled',
        };
      }
      teacher.approved = false;
      teacher.save();
      return {
        message: 'Teacher disabled successfully',
        data: {
          name: teacher.name,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async editTeacher(id: string, body: any) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        throw new HttpException(
          {
            message: 'Teacher not found',
          },
          404,
        );
      }
      if (teacher.approved) {
        throw new HttpException(
          {
            message: 'Approved teachers cannot be edited',
          },
          400,
        );
      }
      if (body.name) {
        teacher.name = body.name;
      }
      await teacher.save();
      return {
        message: 'Teacher edited successfully',
        data: {
          name: teacher.name,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async getSchedule() {
    return await this.scheduleModel.find();
  }

  async addEvent(body: AddEventDto) {
    const newEvent = new this.scheduleModel(body);
    await newEvent.save();
    return {
      message: 'Event added successfully',
    };
  }

  async addTeacherToEvent(body: AddTeacherToEventDto) {
    try {
      const event = await this.scheduleModel.findById(body.event_id);
      if (!event) {
        throw new HttpException(
          {
            message: 'Event not found',
          },
          404,
        );
      }
      //event.participants add like a set

      (event.participants as any).addToSet(...body.teacher_ids);
      await event.save();
      return {
        message:
          'Teachers added to event "' + event.event_name + '" successfully',
      };
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new HttpException(
          {
            message: 'Invalid Teacher id',
          },
          400,
        );
      }

      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }
}
