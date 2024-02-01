import { Module } from '@nestjs/common';
import { UfmService } from './ufm.service';
import { UfmController } from './ufm.controller';

@Module({
  controllers: [UfmController],
  providers: [UfmService]
})
export class UfmModule {}
