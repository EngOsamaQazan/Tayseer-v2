import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourtDto {
  @ApiProperty({ example: 'محكمة إربد الشرعية' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1, required: false, description: 'معرف المدينة من lookups (type=city)' })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
