import { IsNumber, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsNumber()
  roomNo: number;

  @IsString()
  block: string;

  @IsNumber()
  floor: number;
}
