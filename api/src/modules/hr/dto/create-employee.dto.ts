import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 1, description: 'معرف المستخدم' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'EMP-001', required: false })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ required: false, description: 'بيانات الوردية' })
  @IsOptional()
  @IsObject()
  shift?: Record<string, any>;

  @ApiProperty({ required: false, description: 'جهات اتصال الطوارئ' })
  @IsOptional()
  @IsArray()
  emergencyContacts?: Record<string, any>[];

  @ApiProperty({ required: false, description: 'الوثائق' })
  @IsOptional()
  @IsArray()
  documents?: Record<string, any>[];

  @ApiProperty({ required: false, description: 'مكونات الراتب' })
  @IsOptional()
  @IsArray()
  salaryComponents?: Record<string, any>[];

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isFieldStaff?: boolean;

  @ApiProperty({ required: false, example: 'on_duty' })
  @IsOptional()
  @IsString()
  trackingMode?: string;

  @ApiProperty({ required: false, description: 'منطقة العمل' })
  @IsOptional()
  @IsObject()
  workZone?: Record<string, any>;

  @ApiProperty({ required: false, example: 'التحصيل' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false, example: 'محصل' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false, example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 'full_time' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiProperty({ required: false, example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
