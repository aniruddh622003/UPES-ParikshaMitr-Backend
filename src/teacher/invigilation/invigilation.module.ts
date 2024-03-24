import { Module } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { InvigilationController } from './invigilation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorSchema,
} from '../../schemas/room-invigilator.schema';
import { Slot, SlotSchema } from '../../schemas/slot.schema';
import { JwtModule } from '@nestjs/jwt';
import {
  PendingSupplies,
  PendingSuppliesSchema,
} from '../../schemas/pending-supplies.schema';
import {
  FlyingSquad,
  FlyingSquadSchema,
} from '../../schemas/flying-squad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: RoomInvigilator.name, schema: RoomInvigilatorSchema },
      { name: Slot.name, schema: SlotSchema },
      { name: PendingSupplies.name, schema: PendingSuppliesSchema },
      { name: FlyingSquad.name, schema: FlyingSquadSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [InvigilationController],
  providers: [InvigilationService],
})
export class InvigilationModule {}
