import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @ApiProperty({ example: 'CNT-2026-001' })
  @IsNotEmpty()
  @IsString()
  contractNumber: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsNotEmpty()
  @IsDateString()
  contractDate: string;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @ApiProperty({ example: 8000 })
  @IsNotEmpty()
  @IsNumber()
  financedAmount: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  profitRate?: number;

  @ApiProperty({ example: 12 })
  @IsNotEmpty()
  @IsNumber()
  installmentCount: number;

  @ApiProperty({ example: 700 })
  @IsNotEmpty()
  @IsNumber()
  installmentAmount: number;

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsDateString()
  firstInstallmentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
