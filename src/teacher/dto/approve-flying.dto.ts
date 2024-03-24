import { IsString } from 'class-validator';

export class ApproveFlyingDto {
  @IsString()
  room_id: string;

  @IsString()
  flying_squad_id: string;
}
