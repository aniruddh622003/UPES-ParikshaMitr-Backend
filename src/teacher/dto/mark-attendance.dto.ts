import { IsNumber, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @IsString()
  room_id: string;

  @IsString()
  invigilator_id: string;

  @IsNumber()
  sap_id: number;

  @IsNumber()
  ans_sheet_number: number;
}
