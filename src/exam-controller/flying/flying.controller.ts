import { Body, Controller, Post } from '@nestjs/common';
import { FlyingService } from './flying.service';
import { CreateFlyingDto } from './dto/create_flying.dto';

@Controller('exam-controller/flying')
export class FlyingController {
  constructor(private readonly flyingService: FlyingService) {}

  @Post('create')
  create(@Body() body: CreateFlyingDto) {
    return this.flyingService.create(body);
  }
}
