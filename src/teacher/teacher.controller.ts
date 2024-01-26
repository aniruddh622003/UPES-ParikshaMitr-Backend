import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  Req,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherLoginDto } from './dto/teacher-login';
import { TeacherJwtGuard } from '../guards/teacher-jwt.guard';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Post('login')
  login(@Body() teacherLoginDto: TeacherLoginDto) {
    return this.teacherService.login(teacherLoginDto);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('verifyLogin')
  verifyLogin() {
    return {
      message: 'Login verified',
    };
  }

  @UseGuards(TeacherJwtGuard)
  @Get('getSchedule')
  getSchedule(@Req() req) {
    return this.teacherService.getSchedule(req?.user);
  }

  @UseGuards(TeacherJwtGuard)
  @Get('get-notifications')
  getNotifications() {
    return this.teacherService.getNotifications();
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get('/find/:id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(+id);
  }
}
