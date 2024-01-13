import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveInvigilatorDto {
  @IsNotEmpty()
  @IsString()
  invigilatorId: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  controllerId: string;
}
