import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { MovementType } from '../entities/inventory.entity';

export class CreateItemDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsNotEmpty() @IsString()
  sku: string;

  @ApiProperty({ example: 'جهاز كمبيوتر' })
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'إلكترونيات' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional() @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional() @IsNumber()
  unitCost?: number;

  @ApiPropertyOptional({ example: 700 })
  @IsOptional() @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional() @IsNumber()
  reorderLevel?: number;
}

export class CreateMovementDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty() @IsNumber()
  itemId: number;

  @ApiProperty({ enum: MovementType })
  @IsNotEmpty() @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ example: 5 })
  @IsNotEmpty() @IsNumber()
  quantity: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty() @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  supplierId?: number;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'شركة التوريدات' })
  @IsNotEmpty() @IsString()
  name: string;

  @ApiPropertyOptional({ example: '0791234567' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  contactPerson?: string;
}
