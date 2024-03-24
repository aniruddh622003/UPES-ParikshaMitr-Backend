import { ArrayNotEmpty, IsArray, IsDefined, IsString } from 'class-validator';

export class AddTeacherToEventDto {
  @IsString()
  event_id: string;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  teacher_ids: string[];
}
