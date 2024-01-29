import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContTeacherService } from './cont-teacher.provider';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';
import { ExamContGuard } from '../../guards/cont-guard.guard';

@Controller('exam-controller/teacher')
export class ContTeacherController {
  constructor(private readonly contTeacherService: ContTeacherService) {}

  @Get()
  findAll() {
    return {
      message: 'Hello from teacher',
    };
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
}
