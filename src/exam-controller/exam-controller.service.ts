import { Injectable } from '@nestjs/common';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';
import { UpdateExamControllerDto } from './dto/update-exam-controller.dto';

@Injectable()
export class ExamControllerService {
  create(createExamControllerDto: CreateExamControllerDto) {}

  findAll() {
    return `This action returns all examController`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examController`;
  }

  update(id: number, updateExamControllerDto: UpdateExamControllerDto) {
    return `This action updates a #${id} examController`;
  }

  remove(id: number) {
    return `This action removes a #${id} examController`;
  }
}
