import { HttpException, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '../schemas/teacher.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TeacherLoginDto } from './dto/teacher-login';
import { JwtService } from '@nestjs/jwt';
import { Schedule } from '../schemas/schedule.schema';
import {
  add,
  differenceInCalendarDays,
  format,
  isBefore,
  isEqual,
  max,
  min,
} from 'date-fns';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private jwtService: JwtService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const teacher = await this.teacherModel.findOne({
      sap_id: createTeacherDto.sap_id,
    });

    if (teacher) {
      throw new HttpException(
        {
          message: 'Teacher already exists',
        },
        400,
      );
    }

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
    if (!teacherData) {
      throw new HttpException(
        {
          message: 'Teacher not found',
        },
        404,
      );
    }

    if (!teacherData.approved) {
      throw new HttpException(
        {
          message: 'Teacher not approved',
        },
        401,
      );
    }

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
          role: 'teacher',
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

  async findAll() {
    const teachers = await this.teacherModel.find().exec();
    const result = teachers.map((teacher) => {
      const x = teacher.toObject();
      delete x.password;
      return x;
    });
    return result;
  }

  async findOne(id: string) {
    try {
      const teacher: Teacher = await this.teacherModel.findById(id).exec();
      return {
        message: 'Teacher found',
        data: {
          sap_id: teacher.sap_id,
          name: teacher.name,
          approved: teacher.approved,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          message: 'Teacher not found',
        },
        404,
      );
    }
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }

  async getSchedule(user: any) {
    const schedule = await this.scheduleModel.find({
      participants: user.id,
    });
    const mindate: Date = min(schedule.map((event) => event.event_start_time)),
      maxdate: Date = max(schedule.map((event) => event.event_end_time));

    const returnSchedule = {};
    for (
      let i = mindate;
      differenceInCalendarDays(i, maxdate) <= 0;
      i = add(i, { days: 1 })
    ) {
      const dayObject = [];
      schedule.forEach((event) => {
        if (event.event_start_time.getDate() === i.getDate()) {
          dayObject.push({
            timeSlot:
              event.event_start_time.toLocaleTimeString() +
              ' - ' +
              event.event_end_time.toLocaleTimeString(),
            eventName: event.event_name,
            eventDescription: event.event_description,
            location: event.location,
          });
        }
        if (dayObject.length > 0) {
          returnSchedule[format(i, 'yyyy-MM-dd')] = dayObject;
        }
      });
    }
    return {
      returnSchedule,
    };
  }

  async getNotifications() {
    const notifications = await this.notificationModel
      .find()
      .populate('sender', 'name')
      .exec();
    return {
      message: 'Notifications found',
      data: {
        notifications: [
          ...notifications.map((notification) => {
            notification = notification.toObject() as NotificationDocument;
            return {
              _id: notification._id,
              title: notification.title,
              sender: (notification.sender as any).name,
              message: notification.message,
              createdAt: (notification as any).createdAt,
            };
          }),
        ],
      },
    };
  }
}
