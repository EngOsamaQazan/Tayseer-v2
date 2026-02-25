import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../entities/financial-transaction.entity';

export class CreateFinancialTransactionDto {
  @ApiProperty({ example: 'TXN-2025-001' })
  @IsNotEmpty()
  @IsString()
  transactionNumber: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.INCOME })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    enum: TransactionCategory,
    default: TransactionCategory.OTHER,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @ApiProperty({ example: 37.5 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-02-01' })
  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ example: 'دفعة قسط عقد رقم CNT-2025-001' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'معرف العقد المرتبط', required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ description: 'معرف المستثمر/الشركة', required: false })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiProperty({ description: 'معرف الدفعة المرتبطة', required: false })
  @IsOptional()
  @IsNumber()
  incomeId?: number;

  @ApiProperty({ example: 'الصندوق الرئيسي', required: false })
  @IsOptional()
  @IsString()
  fromAccount?: string;

  @ApiProperty({ example: 'البنك العربي', required: false })
  @IsOptional()
  @IsString()
  toAccount?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({
    enum: TransactionStatus,
    default: TransactionStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateFinancialTransactionDto {
  @ApiProperty({ enum: TransactionStatus, required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
