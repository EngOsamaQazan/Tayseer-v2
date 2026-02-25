import { IsNotEmpty, IsOptional, IsString, IsEmail, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCompanyBankDto {
  @ApiProperty({ example: 'البنك العربي' })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  bankNumber: string;

  @ApiProperty({ example: 'JO94ARAB1234567890123456789', required: false })
  @IsOptional()
  @IsString()
  ibanNumber?: string;
}

export class CreateCompanyDto {
  @ApiProperty({ example: 'شركة جدل للأجهزة الكهربائية' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '0789998402' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  socialSecurityNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimaryCompany?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  profitShareRatio?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parentShareRatio?: number;

  @ApiProperty({ type: [CreateCompanyBankDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyBankDto)
  bankAccounts?: CreateCompanyBankDto[];
}
