import { IsArray, IsDefined, IsIn } from 'class-validator';

export class ChangeRoomStatusesDto {
  // Array of room ids
  @IsDefined()
  @IsArray()
  room_ids: string[];

  @IsIn(['INPROGRESS', 'COMPLETED', 'APPROVAL'])
  status: string;
}
