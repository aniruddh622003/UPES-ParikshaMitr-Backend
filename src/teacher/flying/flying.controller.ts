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
import { RequestVisitDto } from './dto/request-visit.dto';
import { FinishDutyDto } from './dto/finish-duty.dto';

@Controller('teacher/flying')
export class FlyingController {
  constructor(private readonly flyingService: FlyingService) {}

  @UseGuards(TeacherJwtGuard)
  @Get('/')
  getFlyingSquad(@Query('room_id') room_id: string) {
    return this.flyingService.getFlyingSquad(room_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('/inv')
  getInvforRoom(@Query('room_id') room_id: string) {
    return this.flyingService.getInvforRoom(room_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('/rooms')
  getRooms(@Req() req: any, @Query('slot_id') slot_id: string) {
    return this.flyingService.getRooms(req?.user.id, slot_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Post('/request-visit')
  requestVisit(@Req() req: any, @Body() body: RequestVisitDto) {
    return this.flyingService.requestVisit(req?.user.id, body);
  }

  @UseGuards(TeacherJwtGuard)
  @Post('/finish-duty')
  finishDuty(@Req() req: any, @Body() body: FinishDutyDto) {
    return this.flyingService.finishDuty(req?.user.id, body);
  }
}
