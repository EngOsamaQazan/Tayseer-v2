import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IncomeStatus } from '../entities/income.entity';

export class CreateIncomeDto {
  @ApiProperty({ example: 1, description: 'معرّف العقد المرتبط بالدفعة' })
  @IsInt()
  @Min(1)
  contractId: number;

  @ApiProperty({ example: '2026-02-25' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ example: 250 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ required: false, example: 'cash' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiProperty({ required: false, example: 'RCPT-2026-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    required: false,
    enum: IncomeStatus,
    example: IncomeStatus.POSTED,
  })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;
}
