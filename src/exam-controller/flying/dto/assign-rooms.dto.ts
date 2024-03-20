import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class AssignRoomsDto {
  @IsString()
  flying_squad_id: string;

  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  room_ids: string[];
}
