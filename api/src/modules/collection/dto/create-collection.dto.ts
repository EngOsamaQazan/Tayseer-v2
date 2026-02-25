import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum,
  IsDateString, IsArray, ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CollectionStatus } from '../entities/collection.entity';

export class CreateCollectionInstallmentDto {
  @ApiProperty({ example: 3, description: 'الشهر' })
  @IsNotEmpty()
  @IsNumber()
  month: number;

  @ApiProperty({ example: 2026, description: 'السنة' })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiProperty({ example: 100.00 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreateCollectionDto {
  @ApiProperty({ example: 1, description: 'معرف العقد' })
  @IsNotEmpty()
  @IsNumber()
  contractId: number;

  @ApiProperty({ required: false, description: 'معرف العميل' })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ required: false, description: 'معرف القضية' })
  @IsOptional()
  @IsNumber()
  judiciaryCaseId?: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1200.00 })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateCollectionInstallmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCollectionInstallmentDto)
  installments?: CreateCollectionInstallmentDto[];
}

export class UpdateCollectionStatusDto {
  @ApiProperty({ enum: CollectionStatus })
  @IsNotEmpty()
  @IsEnum(CollectionStatus)
  status: CollectionStatus;
}

export class QueryCollectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ required: false, enum: CollectionStatus })
  @IsOptional()
  @IsEnum(CollectionStatus)
  status?: CollectionStatus;
}
