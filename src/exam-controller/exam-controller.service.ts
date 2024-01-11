import { HttpException, Injectable } from '@nestjs/common';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';
import { UpdateExamControllerDto } from './dto/update-exam-controller.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { ExamController } from '../schemas/exam-controller.schema';
import { LoginExamControllerDto } from './dto/exam-controller-login.dto';

@Injectable()
export class ExamControllerService {
  constructor(
    @InjectModel(ExamController.name)
    private examControllerModel: Model<ExamController>,
    private jwtService: JwtService,
  ) {}

  async create(createExamControllerDto: CreateExamControllerDto) {
    const pass_hash = await bcrypt.hash(createExamControllerDto.password, 10);
    createExamControllerDto.password = pass_hash;

    const createdController = new this.examControllerModel(
      createExamControllerDto,
    );
    createdController.save();
    return {
      message: 'ExamController created successfully',
      data: {
        name: createdController.name,
      },
    };
  }

  async login(examController: LoginExamControllerDto) {
    const examControllerData = await this.examControllerModel.findOne({
      username: examController.username,
    });
    if (examControllerData) {
      const match = await bcrypt.compare(
        examController.password,
        examControllerData.password,
      );
      if (match) {
        const payload = {
          id: examControllerData._id,
          username: examControllerData.username,
          name: examControllerData.name,
          role: 'exam-controller',
        };
        return {
          message: 'Login successful',
          token: await this.jwtService.signAsync(payload),
        };
      } else {
        throw new HttpException(
          {
            message: 'Wrong password',
          },
          401,
        );
      }
    } else {
      throw new HttpException(
        {
          message: 'User not found',
        },
        404,
      );
    }
  }

  findAll() {
    return this.examControllerModel.find().exec();
  }

  findOne(id: string) {
    return `This action returns a #${id} examController`;
  }

  update(id: number, updateExamControllerDto: UpdateExamControllerDto) {
    return `This action updates a #${id} examController`;
  }

  remove(id: number) {
    return `This action removes a #${id} examController`;
  }
}
