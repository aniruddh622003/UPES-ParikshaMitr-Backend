import { PartialType } from '@nestjs/mapped-types';
import { CreateExamControllerDto } from './create-exam-controller.dto';

export class UpdateExamControllerDto extends PartialType(CreateExamControllerDto) {}
