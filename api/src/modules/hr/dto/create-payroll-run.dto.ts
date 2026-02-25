import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsObject,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollRunDto {
  @ApiProperty({ example: '2026-02', description: 'الفترة بتنسيق YYYY-MM' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'الفترة يجب أن تكون بتنسيق YYYY-MM' })
  period: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePayrollRunDto {
  @ApiProperty({ required: false, example: 'approved' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'كشوفات الرواتب' })
  @IsOptional()
  @IsArray()
  payslips?: Record<string, any>[];

  @ApiProperty({ required: false, description: 'الإجماليات' })
  @IsOptional()
  @IsObject()
  totals?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
