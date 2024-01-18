import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditStudentEligibilityDto {
  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsIn(['YES', 'F_HOLD', 'DEBARRED'])
  eligible: 'YES' | 'F_HOLD' | 'DEBARRED';

  @IsNumber()
  @IsNotEmpty()
  sap_id: number;
}
