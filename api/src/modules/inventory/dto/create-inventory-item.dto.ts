import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'جهاز سامسونج A54' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'SAM-A54-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 'قطعة', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ example: 350, required: false })
  @IsOptional()
  @IsNumber()
  sellPrice?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  currentStock?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  minStock?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiProperty({ required: false, example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
