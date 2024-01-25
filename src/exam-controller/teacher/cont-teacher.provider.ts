import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from '../../schemas/teacher.schema';
import { Model } from 'mongoose';
import { Schedule } from '../../schemas/schedule.schema';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';

@Injectable()
export class ContTeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) {}

  async findUnapprovedTeachers() {
    const teachers = await this.teacherModel.find({ approved: false });
    teachers.forEach((teacher) => {
      delete teacher.password;
    });
    return teachers;
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
