import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'معرف المستخدم' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: '2026-02-25' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false, example: '2026-02-25T08:00:00Z' })
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiProperty({ required: false, example: '2026-02-25T16:00:00Z' })
  @IsOptional()
  @IsString()
  checkOut?: string;

  @ApiProperty({ required: false, example: 'present' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  lateMinutes?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  overtimeMinutes?: number;

  @ApiProperty({ required: false, description: 'بيانات الموقع {lat, lng, method}' })
  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockOutDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
