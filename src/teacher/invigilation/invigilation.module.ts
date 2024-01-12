import { Module } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { InvigilationController } from './invigilation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorSchema,
} from '../../schemas/room-invigilator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: RoomInvigilator.name, schema: RoomInvigilatorSchema },
    ]),
  ],
  controllers: [InvigilationController],
  providers: [InvigilationService],
})
export class InvigilationModule {}
