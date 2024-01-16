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
import { ApproveInvigilatorDto } from './dto/approve-invigilator.dto';
import { CreateSeatingPlanDto } from './dto/create-seating-plan.dto';

@Controller('exam-controller/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post('/room')
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.invigilationService.createRoom(createRoomDto);
  }

  @Get('/room/approve-invigilator')
  getRoomWithPendingInvigilator() {
    return this.invigilationService.getRoomWithApprovalPendingInvigilator();
  }

  @Patch('/room/approve-invigilator')
  approveInvigilator(@Body() approveInvigilatorDto: ApproveInvigilatorDto) {
    return this.invigilationService.approveInvigilator(approveInvigilatorDto);
  }

  @Patch('/room/create-seating-plan')
  createSeatingPlan(@Body() body: CreateSeatingPlanDto) {
    return this.invigilationService.createSeatingPlan(body);
  }
}
