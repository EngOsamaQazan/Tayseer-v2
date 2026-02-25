import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSmsDto {
  @ApiProperty({ example: '0791234567' })
  @IsNotEmpty()
  @IsString()
  recipientNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ example: 'تذكير بموعد القسط' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: false, example: 'payment_reminder' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  entityId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  contractId?: number;
}

export class BulkSmsRecipient {
  @ApiProperty({ example: '0791234567' })
  @IsNotEmpty()
  @IsString()
  recipientNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;
}

export class BulkSmsDto {
  @ApiProperty({ type: [BulkSmsRecipient] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSmsRecipient)
  recipients: BulkSmsRecipient[];

  @ApiProperty({ example: 'تذكير بموعد القسط' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: false, example: 'payment_reminder' })
  @IsOptional()
  @IsString()
  type?: string;
}
