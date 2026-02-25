import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '../entities/judiciary.entity';

export class CreateJudiciaryCaseDto {
  @ApiProperty({ example: 1, description: 'معرف العقد' })
  @IsNotEmpty()
  @IsNumber()
  contractId: number;

  @ApiProperty({ example: 1, description: 'معرف المحكمة' })
  @IsNotEmpty()
  @IsNumber()
  courtId: number;

  @ApiProperty({ example: 1, description: 'معرف المحامي' })
  @IsNotEmpty()
  @IsNumber()
  lawyerId: number;

  @ApiProperty({ required: false, description: 'معرف نوع القضية من lookups (type=judiciary_type)' })
  @IsOptional()
  @IsNumber()
  typeId?: number;

  @ApiProperty({ example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  lawyerCost: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  caseCost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  judiciaryNumber?: number;

  @ApiProperty({ required: false, example: '2026' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  incomeDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  companyId?: number;
}

export class UpdateCaseStatusDto {
  @ApiProperty({ enum: CaseStatus })
  @IsNotEmpty()
  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;
}

export class CreateJudiciaryActionDto {
  @ApiProperty({ example: 1, description: 'معرف القضية' })
  @IsNotEmpty()
  @IsNumber()
  judiciaryCaseId: number;

  @ApiProperty({ example: 'تبليغ', description: 'اسم الإجراء' })
  @IsNotEmpty()
  @IsString()
  actionName: string;

  @ApiProperty({ required: false, description: 'نوع الإجراء' })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actionDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requestStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  decisionText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requestTarget?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;
}

export class QueryJudiciaryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ required: false, enum: CaseStatus })
  @IsOptional()
  @IsEnum(CaseStatus)
  caseStatus?: CaseStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  courtId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  lawyerId?: number;
}
