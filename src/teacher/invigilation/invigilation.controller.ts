import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { AssignInvigilatorDto } from '../dto/assign-invigilator.dto';
import { ApproveInvigilatorDto } from '../dto/approve-Invigilator.dto';
import { MarkAttendanceDto } from '../dto/mark-attendance.dto';
import { TeacherJwtGuard } from '../../guards/teacher-jwt.guard';
import { IssueBSheetDto } from '../dto/issueBsheet.dto';
import { UpdateSuppliesDto } from '../dto/update-supplies.dto';
import { SubmitControlletDto } from '../dto/submit.dto';

@Controller('teacher/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @UseGuards(TeacherJwtGuard)
  @Post('assign-invigilator')
  assignInvigilator(
    @Body() assignInvigilatorDto: AssignInvigilatorDto,
    @Req() req,
  ) {
    return this.invigilationService.assignInvigilator(
      assignInvigilatorDto,
      req?.user.id,
    );
  }

  @UseGuards(TeacherJwtGuard)
  @Get('get-supplies')
  getSupplies(@Req() req, @Query('room_id') room_id: string) {
    return this.invigilationService.getSupplies(req?.user.id, room_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Post('approve-invigilator')
  approveInvigilator(
    @Body() approveInvigilatorDto: ApproveInvigilatorDto,
    @Req() req,
  ) {
    return this.invigilationService.approveInvigilator(
      approveInvigilatorDto,
      req?.user.id,
    );
  }

  @UseGuards(TeacherJwtGuard)
  @Patch('add-supplies')
  addSupplies(@Body() body: UpdateSuppliesDto, @Req() req) {
    return this.invigilationService.addSupplies(body, req?.user.id);
  }

  @UseGuards(TeacherJwtGuard)
  @Patch('update-supplies')
  updateSupplies(@Body() body: UpdateSuppliesDto, @Req() req) {
    return this.invigilationService.updateSupplies(body, req?.user.id);
  }

  @Get('seating-plan')
  getSeatingPlan(@Query('room_id') room_id: string) {
    return this.invigilationService.getSeatingPlan(room_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Post('mark-attendance')
  markAttendance(@Body() body: MarkAttendanceDto, @Req() req) {
    return this.invigilationService.markAttendance(body, req?.user.id);
  }

  @UseGuards(TeacherJwtGuard)
  @Patch('issue-b-sheet')
  issueBSheet(@Body() body: IssueBSheetDto) {
    return this.invigilationService.issueBSheet(body);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('get-b-sheet')
  getBSheet(
    @Query('room_id') room_id: string,
    @Query('sap_id') sap_id: string,
  ) {
    return this.invigilationService.getBSheet(room_id, sap_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('get-status')
  getStatus(@Query('room_id') room_id: string) {
    return this.invigilationService.getStatus(room_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Post('submit')
  submitToController(@Req() req, @Body() body: SubmitControlletDto) {
    return this.invigilationService.submitToController(req?.user.id, body);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('contact-details')
  getContactDetails(@Query('slot_id') slot_id: string) {
    return this.invigilationService.getContactDetails(slot_id);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('get-invigilators')
  getInvigilators(@Query('room_id') room_id: string) {
    return this.invigilationService.getInvigilators(room_id);
  }
}
