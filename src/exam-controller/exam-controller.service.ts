import { HttpException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';
import { UpdateExamControllerDto } from './dto/update-exam-controller.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../schemas/student.schema';
import {
  ExamController,
  ExamControllerDocument,
} from '../schemas/exam-controller.schema';
import { LoginExamControllerDto } from './dto/exam-controller-login.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';

@Injectable()
export class ExamControllerService {
  constructor(
    @InjectModel(ExamController.name)
    private examControllerModel: Model<ExamControllerDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createExamControllerDto: CreateExamControllerDto) {
    const examControllerData = await this.examControllerModel.findOne({
      username: createExamControllerDto.username,
    });
    if (examControllerData) {
      throw new HttpException(
        {
          message: 'Username already exists',
        },
        400,
      );
    }

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

  async getStudentDetailsByAnswerSheetId(answerSheetId: string) {
    try {
      const student = await this.studentModel.findOne({ sheet_id:answerSheetId }).exec();
      if (!student) {
        throw new HttpException(
          { message: 'Student not found for provided answer sheet ID' },
          404,
        );
      }
      return {
        message: 'Student details found',
        data: {
          id: student.id,
          name: student.name,
          sap_id: student.sap_id,
          sheet_id: student.sheet_id,
          course_name: student.course_name,
        },
      };
    } catch (error) {
      throw new HttpException(`Error retrieving student details: ${error.message}`, 500);
    }
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

  async getNotifications() {
    const notifications = await this.notificationModel
      .find()
      .populate('sender', 'name');
    return {
      message: 'Notifications fetched successfully',
      data: {
        notifications,
      },
    };
  }

  async createNotification(
    notificationData: CreateNotificationDto,
    userId: string,
  ) {
    const createdNotification = new this.notificationModel({
      ...notificationData,
      sender: userId,
    });
    await createdNotification.save();
    return {
      message: 'Notification created successfully',
      data: {
        createdNotification,
      },
    };
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
