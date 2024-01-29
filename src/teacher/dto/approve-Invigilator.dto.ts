import { IsString } from 'class-validator';

export class ApproveInvigilatorDto {
  @IsString()
  roomId: string;
}
