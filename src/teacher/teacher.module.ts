import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from '../schemas/teacher.schema';
import { JwtModule } from '@nestjs/jwt';
import { InvigilationModule } from './invigilation/invigilation.module';
import { Schedule, ScheduleSchema } from '../schemas/schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    InvigilationModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
