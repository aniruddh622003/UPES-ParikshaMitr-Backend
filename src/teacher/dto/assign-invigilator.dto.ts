import { IsNotEmpty, IsString } from 'class-validator';

export class AssignInvigilatorDto {
  @IsString()
  @IsNotEmpty()
  unique_code: string;
}
