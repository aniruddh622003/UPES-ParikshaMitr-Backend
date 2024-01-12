import { IsNotEmpty, IsString } from 'class-validator';

export class AssignInvigilatorDto {
  @IsString()
  @IsNotEmpty()
  invigilator_id: string;

  @IsString()
  @IsNotEmpty()
  unique_code: string;
}
