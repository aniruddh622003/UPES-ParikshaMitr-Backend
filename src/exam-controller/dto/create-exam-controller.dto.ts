import { IsString } from 'class-validator';

export class CreateExamControllerDto {
  @IsString()
  name: string;
  @IsString()
  password: string;
}
