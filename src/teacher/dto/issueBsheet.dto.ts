import { IsNumber, IsString } from 'class-validator';

export class IssueBSheetDto {
  @IsString()
  room_id: string;
  @IsString()
  seat_no: string;
  @IsNumber()
  count: number;
}
