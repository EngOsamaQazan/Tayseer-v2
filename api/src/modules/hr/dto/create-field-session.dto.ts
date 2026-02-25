import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartFieldSessionDto {
  @ApiProperty({ required: false, description: 'معلومات الجهاز' })
  @IsOptional()
  @IsObject()
  deviceInfo?: Record<string, any>;

  @ApiProperty({ required: false, description: 'إحداثيات البداية {lat, lng}' })
  @IsOptional()
  @IsObject()
  startLocation?: Record<string, any>;
}

export class EndFieldSessionDto {
  @ApiProperty({ required: false, description: 'إحداثيات النهاية {lat, lng}' })
  @IsOptional()
  @IsObject()
  endLocation?: Record<string, any>;
}

export class AddLocationPointsDto {
  @ApiProperty({ description: 'نقاط الموقع' })
  @IsNotEmpty()
  @IsArray()
  points: Record<string, any>[];
}

export class AddFieldEventDto {
  @ApiProperty({ example: 'arrival', description: 'نوع الحدث' })
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  taskId?: number;
}
