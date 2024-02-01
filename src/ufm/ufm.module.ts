import { Module } from '@nestjs/common';
import { UfmService } from './ufm.service';
import { UfmController } from './ufm.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../schemas/room.schema';
import { UFM, UFMSchema } from '../schemas/ufm.schema';
import { Teacher, TeacherSchema } from '../schemas/teacher.schema';
import { Slot, SlotSchema } from '../schemas/slot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Teacher.name, schema: TeacherSchema },
      { name: Room.name, schema: RoomSchema },
      { name: UFM.name, schema: UFMSchema },
      { name: Slot.name, schema: SlotSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UfmController],
  providers: [UfmService],
})
export class UfmModule {}
