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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
    MongooseModule.forFeature([
      { name: RoomInvigilator.name, schema: RoomInvigilatorSchema },
    ]),
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
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
