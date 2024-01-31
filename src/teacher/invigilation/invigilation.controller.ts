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
}
