import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class contact {
  @IsString()
  name: string;

  @IsNumber()
  phone: string;
}

export class EditContactDto {
  @IsString()
  slot_id: string;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => contact)
  contacts: contact[];
}
