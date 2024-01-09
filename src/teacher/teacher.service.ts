import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '../schemas/teacher.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const pass_hash = await bcrypt.hash(createTeacherDto.password, 10);
    createTeacherDto.password = pass_hash;

    const createdTeacher = new this.teacherModel(createTeacherDto);
    createdTeacher.save();
    return {
      message: 'Teacher created successfully',
      data: {
        sap_id: createdTeacher.sap_id,
        name: createdTeacher.name,
        approved: createdTeacher.approved,
      },
    };
  }

  findAll(): Promise<Teacher[]> {
    return this.teacherModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
