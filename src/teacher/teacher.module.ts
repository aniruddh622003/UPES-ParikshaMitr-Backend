import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../schemas/teacher.schema';
import { JwtModule } from '@nestjs/jwt';
import { InvigilationModule } from './invigilation/invigilation.module';
import { Schedule, ScheduleSchema } from '../schemas/schedule.schema';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import { FlyingModule } from './flying/flying.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    InvigilationModule,
    FlyingModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
