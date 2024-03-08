import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ApproveInvigilatorDto } from './dto/approve-invigilator.dto';
import { CreateSeatingPlanDto } from './dto/create-seating-plan.dto';
import { EditStudentEligibilityDto } from './dto/edit-student-eligibility.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { AddRoomToSlotDto } from './dto/add-room-to-slot.sto';
import { ExamContGuard } from '../../guards/cont-guard.guard';
import { EditContactDto } from './dto/edit-contact.dto';
import { ChangeRoomStatusesDto } from './dto/change-room-statuses.dto';

@Controller('exam-controller/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @UseGuards(ExamContGuard)
  @Get('/slot')
  getSlots() {
    return this.invigilationService.getSlots();
  }

  @UseGuards(ExamContGuard)
  @Get('/slot/:id')
  getSlot(@Param('id') id: string) {
    return this.invigilationService.getSlot(id);
  }

  @UseGuards(ExamContGuard)
  @Post('/slot')
  createSlot(@Body() body: CreateSlotDto) {
    return this.invigilationService.createSlot(body);
  }

  @UseGuards(ExamContGuard)
  @Patch('/slot/add-room')
  addRoomToSlot(@Body() body: AddRoomToSlotDto) {
    return this.invigilationService.addRoomToSlot(body);
  }

  @UseGuards(ExamContGuard)
  @Delete('/slot/delete/:id')
  deleteSlot(@Param('id') id: string) {
    return this.invigilationService.deleteSlot(id);
  }
  @UseGuards(ExamContGuard)
  @Post('/room')
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.invigilationService.createRoom(createRoomDto);
  }

  @UseGuards(ExamContGuard)
  @Patch('/room/change-statuses')
  changeRoomStatus(@Body() body: ChangeRoomStatusesDto) {
    return this.invigilationService.changeRoomStatus(body);
  }

  @UseGuards(ExamContGuard)
  @Get('/room/approve-invigilator')
  getRoomWithPendingInvigilator() {
    return this.invigilationService.getRoomWithApprovalPendingInvigilator();
  }

  @UseGuards(ExamContGuard)
  @Patch('/room/approve-invigilator')
  approveInvigilator(
    @Body() approveInvigilatorDto: ApproveInvigilatorDto,
    @Req() req,
  ) {
    return this.invigilationService.approveInvigilator(
      approveInvigilatorDto,
      req?.user.id,
    );
  }

  @UseGuards(ExamContGuard)
  @Patch('/room/reject-invigilator')
  rejectInvigilator(
    @Body() approveInvigilatorDto: ApproveInvigilatorDto,
    @Req() req,
  ) {
    return this.invigilationService.rejectInvigilator(
      approveInvigilatorDto,
      req?.user.id,
    );
  }

  @UseGuards(ExamContGuard)
  @Patch('/room/create-seating-plan')
  createSeatingPlan(@Body() body: CreateSeatingPlanDto) {
    return this.invigilationService.createSeatingPlan(body);
  }

  @UseGuards(ExamContGuard)
  @Patch('/room/edit-student-eligibility')
  editStudentEligibility(@Body() body: EditStudentEligibilityDto) {
    return this.invigilationService.editStudentEligibility(body);
  }

  @UseGuards(ExamContGuard)
  @Get('/room/total-supplies')
  getTotalSupplies(@Query('room_id') room_id: string) {
    return this.invigilationService.getTotalSupplies(room_id);
  }

  @UseGuards(ExamContGuard)
  @Post('/room/approve-submission')
  approveRoomSubmission(@Body('room_id') room_id: string) {
    return this.invigilationService.approveRoomSubmission(room_id);
  }

  @UseGuards(ExamContGuard)
  @Get('/contact-details')
  getContactDetails(@Query('slot_id') slot_id: string) {
    return this.invigilationService.getContactDetails(slot_id);
  }

  @UseGuards(ExamContGuard)
  @Put('/contact-details')
  updateContactDetails(@Body() body: EditContactDto) {
    return this.invigilationService.updateContactDetails(body);
  }

  @UseGuards(ExamContGuard)
  @Get('/room/supplies')
  getSupplies(@Query('room_id') room_id: string) {
    return this.invigilationService.getSupplies(room_id);
  }

  @UseGuards(ExamContGuard)
  @Get('/room/student-list')
  getStudentList(@Query('room_id') room_id: string) {
    return this.invigilationService.getStudentList(room_id);
  }
}
