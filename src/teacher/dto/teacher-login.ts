import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TeacherLoginDto {
  @IsNumber()
  @IsNotEmpty()
  sap_id: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
