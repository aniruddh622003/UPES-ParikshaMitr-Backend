import { Module } from '@nestjs/common';
import { ExamControllerService } from './exam-controller.service';
import { ExamControllerController } from './exam-controller.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExamController,
  ExamControllerSchema,
} from '../schemas/exam-controller.schema';
import { JwtModule } from '@nestjs/jwt';
import { ContTeacherModule } from './teacher/cont-teacher.module';
import { InvigilationModule } from './invigilation/invigilation.module';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamController.name, schema: ExamControllerSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ContTeacherModule,
    InvigilationModule,
    StudentModule,
  ],
  controllers: [ExamControllerController],
  providers: [ExamControllerService],
})
export class ExamControllerModule {}
