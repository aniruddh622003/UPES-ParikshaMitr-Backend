import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class Student {
  @IsNumber()
  @IsNotEmpty()
  sap_id: number;
  @IsString()
  roll_no: string;
  @IsString()
  student_name: string;
  @IsString()
  course: string;
  @IsString()
  subject: string;
  @IsString()
  subject_code: string;
  @IsString()
  seat_no: string;
  @IsString()
  @IsIn(['YES', 'F_HOLD', 'DEBARRED'])
  eligible: 'YES' | 'F_HOLD' | 'DEBARRED';
}

export class CreateSeatingPlanDto {
  @IsString()
  room_id: string;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Student)
  seating_plan: Student[];
}
