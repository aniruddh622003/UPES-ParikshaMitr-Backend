import { Module } from '@nestjs/common';
import { ContTeacherController } from './cont-teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { ContTeacherService } from './cont-teacher.provider';
import { Schedule, ScheduleSchema } from '../../schemas/schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  controllers: [ContTeacherController],
  providers: [ContTeacherService],
})
export class ContTeacherModule {}
