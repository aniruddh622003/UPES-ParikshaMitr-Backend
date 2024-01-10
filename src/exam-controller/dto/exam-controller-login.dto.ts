import { IsNotEmpty, IsString } from 'class-validator';

export class LoginExamControllerDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
