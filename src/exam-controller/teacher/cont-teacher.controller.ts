import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ContTeacherService } from './cont-teacher.provider';

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
}
