import { HttpException, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '../schemas/teacher.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TeacherLoginDto } from './dto/teacher-login';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    private jwtService: JwtService,
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

  async login(teacher: TeacherLoginDto) {
    const teacherData = await this.teacherModel.findOne({
      sap_id: teacher.sap_id,
    });
    if (teacherData) {
      const match = await bcrypt.compare(
        teacher.password,
        teacherData.password,
      );
      if (match) {
        const payload = {
          id: teacherData._id,
          sap_id: teacherData.sap_id,
          name: teacherData.name,
        };
        return {
          message: 'Login successful',
          token: await this.jwtService.signAsync(payload),
        };
      } else {
        throw new HttpException(
          {
            message: 'Invalid credentials',
          },
          401,
        );
      }
    } else {
      throw new HttpException(
        {
          message: 'Teacher not found',
        },
        404,
      );
    }
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
