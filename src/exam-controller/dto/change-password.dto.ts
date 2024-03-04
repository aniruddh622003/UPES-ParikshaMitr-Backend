import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  teacher_id: string;

  @IsString()
  @IsNotEmpty()
  pass: string;
}
