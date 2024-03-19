import { IsString } from 'class-validator';

export class CreateFlyingDto {
  @IsString()
  teacher_id: string;
  @IsString()
  slot_id: string;
}
