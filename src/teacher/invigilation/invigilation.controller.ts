import { Body, Controller, Post } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { AssignInvigilatorDto } from '../dto/assign-invigilator.dto';
import { ApproveInvigilatorDto } from '../dto/approve-Invigilator.dto';

@Controller('teacher/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post('assign-invigilator')
  assignInvigilator(@Body() assignInvigilatorDto: AssignInvigilatorDto) {
    return this.invigilationService.assignInvigilator(assignInvigilatorDto);
  }

  @Post('approve-invigilator')
  approveInvigilator(@Body() approveInvigilatorDto: ApproveInvigilatorDto) {
    return this.invigilationService.approveInvigilator(approveInvigilatorDto);
  }
}
