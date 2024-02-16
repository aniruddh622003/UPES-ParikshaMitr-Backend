import {
  IsArray,
  IsDateString,
  IsDefined,
  IsIn,
  IsString,
} from 'class-validator';

export class CreateSlotDto {
  @IsString()
  date: Date;

  @IsString()
  @IsIn(['Morning', 'Evening'])
  timeSlot: string;

  @IsDefined()
  @IsArray()
  rooms: string[];
}
