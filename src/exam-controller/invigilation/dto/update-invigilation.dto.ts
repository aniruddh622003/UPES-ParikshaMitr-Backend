import { PartialType } from '@nestjs/mapped-types';
import { CreateInvigilationDto } from './create-invigilation.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateInvigilationDto extends PartialType(CreateInvigilationDto) {}

export class ManualAssignDto {
  @IsString()
  invigilatorId: string;
  @IsString()
  roomId: string;
  @IsString()
  slotId: string;
}

export class SetNumInvigilatorsDto {
  @IsString()
  room_id: string;
  @IsNumber()
  num_inv: number;
}
