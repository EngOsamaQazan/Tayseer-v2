import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiPropertyOptional({ example: 'قيمة جديدة', description: 'قيمة الإعداد' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: 'عنوان الإعداد للعرض' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'وصف الإعداد' })
  @IsOptional()
  @IsString()
  description?: string;
}
