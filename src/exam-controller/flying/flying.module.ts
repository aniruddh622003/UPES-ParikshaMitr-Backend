import { Module } from '@nestjs/common';
import { FlyingService } from './flying.service';
import { FlyingController } from './flying.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FlyingSquad,
  FlyingSquadSchema,
} from '../../schemas/flying-squad.schema';
import { JwtModule } from '@nestjs/jwt';
import { Slot, SlotSchema } from '../../schemas/slot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlyingSquad.name, schema: FlyingSquadSchema },
      { name: Slot.name, schema: SlotSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [FlyingController],
  providers: [FlyingService],
})
export class FlyingModule {}
