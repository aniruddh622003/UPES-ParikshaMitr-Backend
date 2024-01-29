import { Module } from '@nestjs/common';
import { ContTeacherController } from './cont-teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { ContTeacherService } from './cont-teacher.provider';
import { Schedule, ScheduleSchema } from '../../schemas/schedule.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
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
