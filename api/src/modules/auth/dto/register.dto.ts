import { IsNotEmpty, IsOptional, IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'شركة نماء للأجهزة بالأقساط' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'namaa' })
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  companySlug: string;

  @ApiProperty({ example: '0789998402', required: false })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin@namaa.co' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'أسامة', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'قازان', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;
}
