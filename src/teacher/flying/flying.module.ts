import { Module } from '@nestjs/common';
import { FlyingService } from './flying.service';
import { FlyingController } from './flying.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FlyingSquad,
  FlyingSquadSchema,
} from '../../schemas/flying-squad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlyingSquad.name, schema: FlyingSquadSchema },
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
