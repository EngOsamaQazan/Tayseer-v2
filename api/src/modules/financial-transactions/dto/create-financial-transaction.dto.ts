import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  FinancialTransactionDirection,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../entities/financial-transaction.entity';

export class CreateFinancialTransactionDto {
  @ApiProperty({ required: false, example: 'FT-2026-000001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transactionNumber?: string;

  @ApiProperty({ example: '2026-02-25' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ enum: FinancialTransactionType, example: FinancialTransactionType.INCOME })
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @ApiProperty({
    required: false,
    enum: FinancialTransactionDirection,
    example: FinancialTransactionDirection.IN,
  })
  @IsOptional()
  @IsEnum(FinancialTransactionDirection)
  direction?: FinancialTransactionDirection;

  @ApiProperty({ example: 350 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ required: false, example: 'cash' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiProperty({ required: false, example: 'REF-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiProperty({ required: false, example: 'Main Cashbox' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountName?: string;

  @ApiProperty({ required: false, example: 'دفعة أقساط شهر فبراير' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'income' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceModule?: string;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sourceReferenceId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  contractId?: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  customerId?: number;

  @ApiProperty({ required: false, example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiProperty({
    required: false,
    enum: FinancialTransactionStatus,
    example: FinancialTransactionStatus.POSTED,
  })
  @IsOptional()
  @IsEnum(FinancialTransactionStatus)
  status?: FinancialTransactionStatus;
}
