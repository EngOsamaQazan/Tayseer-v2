import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-001' })
  @IsNotEmpty() @IsString()
  employeeNumber: string;

  @ApiProperty({ example: 'أحمد محمد' })
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'محاسب' })
  @IsOptional() @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'المالية' })
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '0791234567' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional() @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional() @IsNumber()
  salary?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class CreateAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty() @IsNumber()
  employeeId: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty() @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional() @IsString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '16:00' })
  @IsOptional() @IsString()
  checkOut?: string;

  @ApiPropertyOptional({ example: 'present' })
  @IsOptional() @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}

export class CreatePayrollDto {
  @ApiProperty({ example: '2026-03', description: 'YYYY-MM' })
  @IsNotEmpty() @IsString()
  month: string;
}
