import { IsArray, IsDateString, IsDefined, IsString } from 'class-validator';

export class AddEventDto {
  @IsString()
  event_name: string;

  @IsString()
  event_description: string;

  @IsDateString()
  event_start_time: Date;

  @IsDateString()
  event_end_time: Date;

  @IsString()
  location: string;

  @IsDefined()
  @IsArray()
  participants: string[];
}
