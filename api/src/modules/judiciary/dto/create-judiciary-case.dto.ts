import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { CaseType, CaseStatus } from '../entities/judiciary-case.entity';

export class CreateJudiciaryCaseDto {
  @ApiProperty({ example: 'CASE-2026-001' })
  @IsNotEmpty()
  @IsString()
  caseNumber: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ enum: CaseType, example: 'execution' })
  @IsNotEmpty()
  @IsEnum(CaseType)
  caseType: CaseType;

  @ApiProperty({ example: '2026-01-15' })
  @IsNotEmpty()
  @IsDateString()
  filingDate: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  nextSessionDate?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  claimAmount?: number;

  @ApiPropertyOptional({ example: 'محكمة إربد الابتدائية' })
  @IsOptional()
  @IsString()
  court?: string;

  @ApiPropertyOptional({ example: 'أحمد محمود' })
  @IsOptional()
  @IsString()
  lawyer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: CaseStatus })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;
}
