import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateTeacherDto {
  @IsPhoneNumber('IN')
  phone: string;
  @IsEmail()
  email: string;
}
