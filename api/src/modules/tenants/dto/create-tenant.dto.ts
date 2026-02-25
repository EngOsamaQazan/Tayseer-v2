import { IsNotEmpty, IsOptional, IsString, IsEmail, IsNumber, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'شركة نماء للأجهزة بالأقساط' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'namaa', description: 'معرف فريد - حروف إنجليزية وأرقام فقط' })
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'الـ slug يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطات فقط' })
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'pro', required: false })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;
}
