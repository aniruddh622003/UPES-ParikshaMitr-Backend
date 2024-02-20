import { IsString } from 'class-validator';

export class SubmitControlletDto {
  @IsString()
  unique_code: string;
}
