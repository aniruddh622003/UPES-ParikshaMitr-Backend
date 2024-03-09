import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { ExamContGuard } from '../../guards/cont-guard.guard';

@Controller('exam-controller/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @UseGuards(ExamContGuard)
  @Get('search-student')
  searchStudent(
    @Query('sap_id') sap_id: string,
    @Query('roll_no') roll_no: string,
  ) {
    return this.studentService.searchStudent(sap_id, roll_no);
  }
}
