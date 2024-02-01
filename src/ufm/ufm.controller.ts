import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UfmService } from './ufm.service';
import { TeacherJwtGuard } from '../guards/teacher-jwt.guard';
import { MarkUFMDto } from './dto/mark_ufm.dto';

@Controller('ufm')
export class UfmController {
  constructor(private readonly ufmService: UfmService) {}

  @UseGuards(TeacherJwtGuard)
  @Post('mark-ufm')
  markUfm(@Body() body: MarkUFMDto, @Req() req: any) {
    return this.ufmService.markUfm(body, req.user);
  }
}
