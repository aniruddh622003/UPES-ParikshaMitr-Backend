import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ContTeacherService } from './cont-teacher.provider';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';

@Controller('exam-controller/teacher')
export class ContTeacherController {
  constructor(private readonly contTeacherService: ContTeacherService) {}

  @Get()
  findAll() {
    return {
      message: 'Hello from teacher',
    };
  }

  @Get('unapproved')
  findUnapprovedTeachers() {
    return this.contTeacherService.findUnapprovedTeachers();
  }

  @Patch('approve/:id')
  approveTeacher(@Param('id') id: string) {
    return this.contTeacherService.approveTeacher(id);
  }

  @Get('schedule')
  getSchedule() {
    return this.contTeacherService.getSchedule();
  }

  @Post('schedule/add')
  addEvent(@Body() body: AddEventDto) {
    return this.contTeacherService.addEvent(body);
  }

  @Post('schedule/add-teacher')
  addTeacherToEvent(@Body() body: AddTeacherToEventDto) {
    return this.contTeacherService.addTeacherToEvent(body);
  }
}
