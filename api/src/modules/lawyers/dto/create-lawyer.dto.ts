import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLawyerDto {
  @ApiProperty({ example: 'محمد أحمد المحامي' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, example: '0791234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'نوع المحامي' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
