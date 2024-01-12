import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('exam-controller/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post('/room')
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.invigilationService.createRoom(createRoomDto);
  }
}
