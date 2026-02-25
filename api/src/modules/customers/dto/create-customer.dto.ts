import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ example: 'إربد', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  building?: string;
}

export class CreatePhoneDto {
  @ApiProperty({ example: '0791234567' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'mobile', required: false })
  @IsOptional()
  @IsString()
  phoneType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ownerName?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'محمد أحمد علي الخالدي' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'إربد' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: '9901234567' })
  @IsNotEmpty()
  @IsString()
  idNumber: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 1, description: '1=ذكر, 2=أنثى' })
  @IsNotEmpty()
  @IsNumber()
  sex: number;

  @ApiProperty({ example: '0791234567' })
  @IsNotEmpty()
  @IsString()
  primaryPhoneNumber: string;

  @ApiProperty({ example: 'أردني' })
  @IsNotEmpty()
  @IsString()
  citizen: string;

  @ApiProperty({ example: 'إعلان' })
  @IsNotEmpty()
  @IsString()
  hearAboutUs: string;

  @ApiProperty({ example: 0, description: '0=لا, 1=نعم' })
  @IsNotEmpty()
  @IsNumber()
  isSocialSecurity: number;

  @ApiProperty({ example: 0, description: '0=لا, 1=نعم' })
  @IsNotEmpty()
  @IsNumber()
  doHaveAnyProperty: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  jobTitle?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  socialSecurityNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateAddressDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];

  @ApiProperty({ type: [CreatePhoneDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneDto)
  phoneNumbers?: CreatePhoneDto[];
}
