import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'معرف المستخدم المستلم' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'طلب إجازة جديد' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ example: 'leave_request', description: 'نوع الإشعار' })
  @IsNotEmpty()
  @IsString()
  type: string;

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
  @IsString()
  actionUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkNotificationDto {
  @ApiProperty({ description: 'قائمة معرفات المستخدمين' })
  @IsNotEmpty()
  @IsArray()
  userIds: number[];

  @ApiProperty({ example: 'إعلان هام' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ example: 'announcement' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
