import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsDateString,
  IsArray, ValidateNested, IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContractType, ContractStatus } from '../entities/contract.entity';

export class CreateContractPartyDto {
  @ApiProperty({ example: 1, description: 'معرف العميل' })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 'client', description: 'client أو guarantor' })
  @IsNotEmpty()
  @IsString()
  customerType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  loanNumber?: number;
}

export class CreateContractItemDto {
  @ApiProperty({ example: 'جهاز آيفون 15' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;
}

export class CreateContractDto {
  @ApiProperty({ enum: ContractType, example: 'normal' })
  @IsNotEmpty()
  @IsEnum(ContractType)
  type: ContractType;

  @ApiProperty({ example: 1, description: 'معرف الشركة/المستثمر' })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  dateOfSale: string;

  @ApiProperty({ example: 5000.00 })
  @IsNotEmpty()
  @IsNumber()
  totalValue: number;

  @ApiProperty({ example: 500.00, required: false })
  @IsOptional()
  @IsNumber()
  firstInstallmentValue?: number;

  @ApiProperty({ example: '2026-04-01', required: false })
  @IsOptional()
  @IsDateString()
  firstInstallmentDate?: string;

  @ApiProperty({ example: 250.00, required: false })
  @IsOptional()
  @IsNumber()
  monthlyInstallmentValue?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  commitmentDiscount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateContractPartyDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractPartyDto)
  parties: CreateContractPartyDto[];

  @ApiProperty({ type: [CreateContractItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractItemDto)
  items?: CreateContractItemDto[];
}

export class UpdateContractStatusDto {
  @ApiProperty({ enum: ContractStatus })
  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryContractsDto {
  @ApiProperty({ required: false, enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
