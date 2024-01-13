import { IsString } from 'class-validator';

export class ApproveInvigilatorDto {
  @IsString()
  invigilatorId: string;

  @IsString()
  roomId: string;
}
