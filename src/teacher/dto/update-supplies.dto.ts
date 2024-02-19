import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class Supply {
  @IsString()
  @IsNotEmpty()
  readonly type: string;

  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number;
}

export class UpdateSuppliesDto {
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Supply)
  readonly pending_supplies: Supply[];
}
