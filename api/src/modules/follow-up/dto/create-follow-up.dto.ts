import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUpDto {
  @ApiProperty({ example: 1, description: 'معرف العقد' })
  @IsNotEmpty()
  @IsNumber()
  contractId: number;

  @ApiProperty({ required: false, description: 'تاريخ ووقت المتابعة' })
  @IsOptional()
  @IsString()
  dateTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, description: 'معرف الشعور من lookups (type=feeling)' })
  @IsOptional()
  @IsNumber()
  feelingId?: number;

  @ApiProperty({ required: false, description: 'هدف الاتصال' })
  @IsOptional()
  @IsNumber()
  connectionGoal?: number;

  @ApiProperty({ required: false, description: 'تاريخ التذكير' })
  @IsOptional()
  @IsDateString()
  reminder?: string;

  @ApiProperty({ required: false, description: 'وعد بالدفع بتاريخ' })
  @IsOptional()
  @IsDateString()
  promiseToPayAt?: string;

  @ApiProperty({ required: false, description: 'نوع الاتصال (phone, visit, sms)' })
  @IsOptional()
  @IsString()
  connectionType?: string;

  @ApiProperty({ required: false, description: 'معرف نتيجة الاتصال من lookups (type=connection_response)' })
  @IsOptional()
  @IsNumber()
  connectionResponseId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  connectionNote?: string;

  @ApiProperty({ required: false, description: 'معرف العميل المتصل به' })
  @IsOptional()
  @IsNumber()
  customerId?: number;
}

export class QueryFollowUpDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  createdBy?: number;
}
