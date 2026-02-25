import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethod,
  IncomeStatus,
  IncomeType,
} from '../entities/income.entity';

export class CreateIncomeDto {
  @ApiProperty({ example: 'RCT-2025-001' })
  @IsNotEmpty()
  @IsString()
  receiptNumber: string;

  @ApiProperty({ example: 1, description: 'معرف العقد', required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ example: 1, description: 'معرف العميل', required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ enum: IncomeType, default: IncomeType.INSTALLMENT })
  @IsOptional()
  @IsEnum(IncomeType)
  type?: IncomeType;

  @ApiProperty({ example: 37.5, description: 'مبلغ الدفعة' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-02-01' })
  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 1, description: 'رقم القسط', required: false })
  @IsOptional()
  @IsNumber()
  installmentNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checkNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ enum: IncomeStatus, default: IncomeStatus.CONFIRMED, required: false })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'معرف المحصّل', required: false })
  @IsOptional()
  @IsNumber()
  collectedBy?: number;
}

export class UpdateIncomeDto {
  @ApiProperty({ enum: IncomeStatus, required: false })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checkNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
