import { IsString } from 'class-validator';

export class RequestVisitDto {
  @IsString()
  room_id: string;

  @IsString()
  slot_id: string;

  @IsString()
  room_remarks: string;
}
