import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @ApiProperty({ example: 1, description: 'معرف الصنف' })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ enum: MovementType, example: 'in' })
  @IsNotEmpty()
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false, example: 200 })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ example: '2026-02-25' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  purchaseOrderId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;
}
