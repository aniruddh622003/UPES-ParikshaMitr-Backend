import { IsString } from 'class-validator';

export class FinishDutyDto {
  @IsString()
  final_remarks: string;

  @IsString()
  slot_id: string;
}
