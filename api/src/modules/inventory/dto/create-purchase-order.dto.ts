import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseOrderDto {
  @ApiProperty({ required: false, example: 'PO-2026-001' })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({ example: 1, description: 'معرف المورد' })
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @ApiProperty({ example: '2026-02-25' })
  @IsNotEmpty()
  @IsDateString()
  orderDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiProperty({
    required: false,
    description: 'عناصر الطلب [{itemId, quantity, unitPrice}]',
  })
  @IsOptional()
  @IsArray()
  items?: Record<string, any>[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
