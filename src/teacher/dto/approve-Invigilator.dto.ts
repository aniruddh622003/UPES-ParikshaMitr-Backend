import { IsDefined, IsString } from 'class-validator';

export class ApproveInvigilatorDto {
  @IsString()
  roomId: string;

  @IsDefined()
  pending_supplies: [
    {
      type: string;
      quantity: number;
    },
  ];
}
