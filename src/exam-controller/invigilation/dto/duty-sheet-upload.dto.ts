import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class DutySheetUploadDto {
  @IsString()
  slot_id: string;

  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  fly_sap_ids: number[];

  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  inv_sap_ids: number[];
}
