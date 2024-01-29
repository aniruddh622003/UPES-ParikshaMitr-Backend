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
import { EditStudentEligibilityDto } from './dto/edit-student-eligibility.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { AddRoomToSlotDto } from './dto/add-room-to-slot.sto';

@Controller('exam-controller/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post('/slot')
  createSlot(@Body() body: CreateSlotDto) {
    return this.invigilationService.createSlot(body);
  }

  @Patch('/slot/add-room')
  addRoomToSlot(@Body() body: AddRoomToSlotDto) {
    return this.invigilationService.addRoomToSlot(body);
  }

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

  @Patch('/room/edit-student-eligibility')
  editStudentEligibility(@Body() body: EditStudentEligibilityDto) {
    return this.invigilationService.editStudentEligibility(body);
  }
}
