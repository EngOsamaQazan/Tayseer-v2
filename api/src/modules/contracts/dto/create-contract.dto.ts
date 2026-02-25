import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @ApiProperty({ example: 'CNT-2026-0001' })
  @IsNotEmpty()
  @IsString()
  contractNumber: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  customerId: number;

  @ApiProperty({ example: 2, description: 'معرّف المستثمر (companyId)' })
  @IsInt()
  @Min(1)
  companyId: number;

  @ApiProperty({ example: '2026-02-25' })
  @IsDateString()
  contractDate: string;

  @ApiProperty({ required: false, example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2028-03-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  principalAmount: number;

  @ApiProperty({ required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  profitAmount?: number;

  @ApiProperty({ required: false, example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  feesAmount?: number;

  @ApiProperty({
    required: false,
    example: 5525,
    description: 'إن لم يرسل يتم احتسابه تلقائياً = أصل + ربح + رسوم',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({ required: false, example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiProperty({ required: false, example: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  installmentsCount?: number;

  @ApiProperty({ required: false, example: 230.21 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentAmount?: number;

  @ApiProperty({ required: false, example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiProperty({
    required: false,
    enum: ContractStatus,
    example: ContractStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
