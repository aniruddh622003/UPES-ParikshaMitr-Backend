import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { ExamControllerService } from './exam-controller.service';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';
import { UpdateExamControllerDto } from './dto/update-exam-controller.dto';
import { LoginExamControllerDto } from './dto/exam-controller-login.dto';
import { ExamContGuard } from '../guards/cont-guard.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('exam-controller')
export class ExamControllerController {
  constructor(private readonly examControllerService: ExamControllerService) {}

  @Post()
  create(@Body() createExamControllerDto: CreateExamControllerDto) {
    return this.examControllerService.create(createExamControllerDto);
  }

  @Get('get-student/:answerSheetId')
  async getStudentDetailsByAnswerSheetId(@Param('answerSheetId') answerSheetId: string) {
    const student = await this.examControllerService.getStudentDetailsByAnswerSheetId(answerSheetId);
    if (!student) {
      throw new HttpException(
        { message: 'Student not found for provided answer sheet ID' },
        404,
      );
    }
    return student;
  }

  @Post('login')
  login(@Body() loginData: LoginExamControllerDto) {
    return this.examControllerService.login(loginData);
  }

  @UseGuards(ExamContGuard)
  @Get('verifyLogin')
  verifyLogin() {
    return {
      message: 'Login successful',
    };
  }

  @UseGuards(ExamContGuard)
  @Get('get-notifications')
  getNotifications() {
    return this.examControllerService.getNotifications();
  }

  @UseGuards(ExamContGuard)
  @Post('create-notification')
  createNotification(
    @Body() notificationData: CreateNotificationDto,
    @Req() req,
  ) {
    return this.examControllerService.createNotification(
      notificationData,
      req?.user.id,
    );
  }

  @Get()
  findAll() {
    return this.examControllerService.findAll();
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.examControllerService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateExamControllerDto: UpdateExamControllerDto,
  ) {
    return this.examControllerService.update(+id, updateExamControllerDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.examControllerService.remove(+id);
  }
}
