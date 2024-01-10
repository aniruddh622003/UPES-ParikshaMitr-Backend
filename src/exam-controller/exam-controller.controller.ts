import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamControllerService } from './exam-controller.service';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';
import { UpdateExamControllerDto } from './dto/update-exam-controller.dto';

@Controller('exam-controller')
export class ExamControllerController {
  constructor(private readonly examControllerService: ExamControllerService) {}

  @Post()
  create(@Body() createExamControllerDto: CreateExamControllerDto) {
    return this.examControllerService.create(createExamControllerDto);
  }

  @Get()
  findAll() {
    return this.examControllerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examControllerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamControllerDto: UpdateExamControllerDto,
  ) {
    return this.examControllerService.update(+id, updateExamControllerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examControllerService.remove(+id);
  }
}
