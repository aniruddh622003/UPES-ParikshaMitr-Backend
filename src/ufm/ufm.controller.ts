import { Controller } from '@nestjs/common';
import { UfmService } from './ufm.service';

@Controller('ufm')
export class UfmController {
  constructor(private readonly ufmService: UfmService) {}
}
