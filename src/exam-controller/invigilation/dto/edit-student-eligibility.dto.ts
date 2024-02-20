import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditStudentEligibilityDto {
  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsIn(['YES', 'F_HOLD', 'DEBARRED', 'R_HOLD'])
  eligible: 'YES' | 'F_HOLD' | 'DEBARRED' | 'R_HOLD';

  @IsNumber()
  @IsNotEmpty()
  sap_id: number;
}
