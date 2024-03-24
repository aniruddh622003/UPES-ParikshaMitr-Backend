import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorSchema,
} from '../../schemas/room-invigilator.schema';
import { Slot, SlotSchema } from '../../schemas/slot.schema';
import { ExamController } from '../entities/exam-controller.entity';
import { ExamControllerSchema } from '../../schemas/exam-controller.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: RoomInvigilator.name, schema: RoomInvigilatorSchema },
      { name: Slot.name, schema: SlotSchema },
      { name: ExamController.name, schema: ExamControllerSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
