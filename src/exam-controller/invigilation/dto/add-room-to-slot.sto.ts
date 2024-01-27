import { ArrayNotEmpty, IsArray, IsDefined, IsString } from 'class-validator';

export class AddRoomToSlotDto {
  @IsString()
  slotId: string;
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  roomIds: string[];
}
