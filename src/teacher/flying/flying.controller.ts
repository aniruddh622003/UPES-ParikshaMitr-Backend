import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FlyingService } from './flying.service';
import { TeacherJwtGuard } from '../../guards/teacher-jwt.guard';

@Controller('teacher/flying')
export class FlyingController {
  constructor(private readonly flyingService: FlyingService) {}

  @UseGuards(TeacherJwtGuard)
  @Get('/')
  getFlyingSquad(@Query('room_id') room_id: string) {
    return this.flyingService.getFlyingSquad(room_id);
  }
}
