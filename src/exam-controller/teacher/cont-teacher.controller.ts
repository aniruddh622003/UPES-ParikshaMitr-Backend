import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContTeacherService } from './cont-teacher.provider';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';
import { ExamContGuard } from '../../guards/cont-guard.guard';

@Controller('exam-controller/teacher')
export class ContTeacherController {
  constructor(private readonly contTeacherService: ContTeacherService) {}

  @UseGuards(ExamContGuard)
  @Get('/approved')
  findAll() {
    return this.contTeacherService.findApproved();
  }

  @UseGuards(ExamContGuard)
  @Get('unapproved')
  findUnapprovedTeachers() {
    return this.contTeacherService.findUnapprovedTeachers();
  }

  @UseGuards(ExamContGuard)
  @Patch('approve/:id')
  approveTeacher(@Param('id') id: string) {
    return this.contTeacherService.approveTeacher(id);
  }

  @UseGuards(ExamContGuard)
  @Patch('/disable/:id')
  disableTeacher(@Param('id') id: string) {
    return this.contTeacherService.disableTeacher(id);
  }

  @UseGuards(ExamContGuard)
  @Delete('/delete/:id')
  deleteTeacher(@Param('id') id: string) {
    return this.contTeacherService.deleteTeacher(id);
  }

  @UseGuards(ExamContGuard)
  @Put('/edit/:id')
  editTeacher(@Param('id') id: string, @Body() body: any) {
    return this.contTeacherService.editTeacher(id, body);
  }

  @UseGuards(ExamContGuard)
  @Get('schedule')
  getSchedule() {
    return this.contTeacherService.getSchedule();
  }

  @UseGuards(ExamContGuard)
  @Post('schedule/add')
  addEvent(@Body() body: AddEventDto) {
    return this.contTeacherService.addEvent(body);
  }

  @UseGuards(ExamContGuard)
  @Post('schedule/add-teacher')
  addTeacherToEvent(@Body() body: AddTeacherToEventDto) {
    return this.contTeacherService.addTeacherToEvent(body);
  }

  @UseGuards(ExamContGuard)
  @Get('slot-attendance')
  getSlotAttendance() {
    return this.contTeacherService.getSlotAttendance();
  }
}
