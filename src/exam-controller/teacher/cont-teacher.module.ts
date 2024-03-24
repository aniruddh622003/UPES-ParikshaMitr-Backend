import { Module } from '@nestjs/common';
import { ContTeacherController } from './cont-teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { ContTeacherService } from './cont-teacher.provider';
import { Schedule, ScheduleSchema } from '../../schemas/schedule.schema';
import { JwtModule } from '@nestjs/jwt';
import { Slot, SlotSchema } from '../../schemas/slot.schema';
import {
  RoomInvigilator,
  RoomInvigilatorSchema,
} from '../../schemas/room-invigilator.schema';
import { Room, RoomSchema } from '../../schemas/room.schema';
import { ExamController } from '../entities/exam-controller.entity';
import { ExamControllerSchema } from '../../schemas/exam-controller.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: ExamController.name, schema: ExamControllerSchema },
      { name: Slot.name, schema: SlotSchema },
      { name: RoomInvigilator.name, schema: RoomInvigilatorSchema },
      { name: Room.name, schema: RoomSchema },
    ]),

    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [ContTeacherController],
  providers: [ContTeacherService],
})
export class ContTeacherModule {}
