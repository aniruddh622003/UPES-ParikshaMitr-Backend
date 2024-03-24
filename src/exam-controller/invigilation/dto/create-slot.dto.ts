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
  @IsIn(['Morning', 'Evening', 'Afternoon'])
  timeSlot: string;

  @IsString()
  @IsIn(['Midsem', 'Endsem'])
  type: string;

  @IsDefined()
  @IsArray()
  rooms: string[];
}
