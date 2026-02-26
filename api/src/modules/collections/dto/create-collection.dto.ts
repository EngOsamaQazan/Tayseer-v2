import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 6, description: 'عدد الأقساط' })
  @IsNotEmpty()
  @IsNumber()
  installmentCount: number;

  @ApiProperty({ example: 833.33 })
  @IsNotEmpty()
  @IsNumber()
  installmentAmount: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  firstDueDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assignedTo?: number;
}
