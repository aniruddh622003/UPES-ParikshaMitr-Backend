import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

class IncriminatingMaterial {
  @IsNumber()
  printed_pages: number;

  @IsNumber()
  handwritten_pages: number;

  @IsNumber()
  communication_devices: number;

  @IsNumber()
  torn_book_pages: number;
}

class RecoveredFrom {
  @IsBoolean()
  student_hand: boolean;
  @IsBoolean()
  student_pocket: boolean;
  @IsBoolean()
  student_shoe: boolean;
  @IsBoolean()
  student_underclothes: boolean;
  @IsBoolean()
  on_table: boolean;
  @IsBoolean()
  in_answer_book: boolean;
  @IsBoolean()
  under_answer_book: boolean;
  @IsBoolean()
  under_question_paper: boolean;
  @IsBoolean()
  under_feet: boolean;
  @IsBoolean()
  in_desk: boolean;
  @IsBoolean()
  near_desk: boolean;
  @IsBoolean()
  other: boolean;
}

export class MarkUFMDto {
  @IsString()
  room_id: string;

  @IsString()
  sap_id: string;

  @IsString()
  father_name: string;

  @IsString()
  address: string;

  @IsString()
  @Length(10, 10)
  mobile: string;

  @IsString()
  @Length(10, 10)
  emergency_contact: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => IncriminatingMaterial)
  incriminating_material: IncriminatingMaterial;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => RecoveredFrom)
  recovered_from: RecoveredFrom;

  @IsString()
  other_mode_of_misconduct: string;
}
