import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSystemSettingDto {
  @ApiProperty({ example: 'company_name', description: 'مفتاح الإعداد' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: 'شركة تيسير', description: 'قيمة الإعداد' })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiPropertyOptional({
    example: 'general',
    description: 'تصنيف الإعداد',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'اسم الشركة',
    description: 'عنوان الإعداد للعرض',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    example: 'string',
    description: 'نوع القيمة: string, number, boolean, json',
  })
  @IsOptional()
  @IsString()
  valueType?: string;

  @ApiPropertyOptional({ description: 'وصف الإعداد' })
  @IsOptional()
  @IsString()
  description?: string;
}
