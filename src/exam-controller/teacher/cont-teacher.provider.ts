import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from '../../schemas/teacher.schema';
import { Model } from 'mongoose';

@Injectable()
export class ContTeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
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
}
