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

export class Student {
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
  @IsIn(['YES', 'F_HOLD', 'DEBARRED', 'R_HOLD'])
  eligible: 'YES' | 'F_HOLD' | 'DEBARRED' | 'R_HOLD';
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

export class AddStudentDto {
  @IsString()
  room_id: string;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => Student)
  student: Student;
}
