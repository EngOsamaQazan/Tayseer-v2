import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractItemDto {
  @ApiProperty({ example: 'جهاز آيفون 15 برو' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'لون أسود - 256GB', required: false })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 400 })
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 400 })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'iPhone 15 Pro', required: false })
  @IsOptional()
  @IsString()
  model?: string;
}

export class CreateContractGuarantorDto {
  @ApiProperty({ example: 'خالد محمد العلي' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '9801234567', required: false })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ example: '0791234567', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'أخ', required: false })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workplace?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;
}

export class CreateContractDto {
  @ApiProperty({ example: 'CNT-2025-001' })
  @IsNotEmpty()
  @IsString()
  contractNumber: string;

  @ApiProperty({ example: 1, description: 'معرف العميل' })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 1, description: 'معرف المستثمر/الشركة' })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsNotEmpty()
  @IsDateString()
  contractDate: string;

  @ApiProperty({ example: '2025-02-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2026-02-01', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 400, description: 'السعر النقدي' })
  @IsNotEmpty()
  @IsNumber()
  cashPrice: number;

  @ApiProperty({ example: 500, description: 'سعر البيع بالتقسيط' })
  @IsNotEmpty()
  @IsNumber()
  salePrice: number;

  @ApiProperty({ example: 50, description: 'الدفعة الأولى' })
  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @ApiProperty({ example: 450, description: 'المبلغ الممول' })
  @IsNotEmpty()
  @IsNumber()
  financedAmount: number;

  @ApiProperty({ example: 25, description: 'نسبة الربح %', required: false })
  @IsOptional()
  @IsNumber()
  profitRate?: number;

  @ApiProperty({ example: 100, description: 'مبلغ الربح', required: false })
  @IsOptional()
  @IsNumber()
  profitAmount?: number;

  @ApiProperty({ example: 500, description: 'المبلغ الإجمالي' })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 12, description: 'عدد الأقساط' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numberOfInstallments: number;

  @ApiProperty({ example: 37.5, description: 'مبلغ القسط الواحد' })
  @IsNotEmpty()
  @IsNumber()
  installmentAmount: number;

  @ApiProperty({ enum: ContractStatus, default: ContractStatus.DRAFT, required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ type: [CreateContractItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractItemDto)
  items?: CreateContractItemDto[];

  @ApiProperty({ type: [CreateContractGuarantorDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractGuarantorDto)
  guarantors?: CreateContractGuarantorDto[];
}

export class UpdateContractDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: ContractStatus, required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  downPayment?: number;
}
