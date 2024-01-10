import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeacherModule } from './teacher/teacher.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ExamControllerModule } from './exam-controller/exam-controller.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),

    TeacherModule,

    ExamControllerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
