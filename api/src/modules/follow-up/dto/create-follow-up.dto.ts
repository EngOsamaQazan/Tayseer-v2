import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { FollowUpType, FollowUpStatus } from '../entities/follow-up.entity';

export class CreateFollowUpDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  contractId?: number;

  @ApiProperty({ enum: FollowUpType, example: 'call' })
  @IsNotEmpty()
  @IsEnum(FollowUpType)
  type: FollowUpType;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  followUpDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assignedTo?: number;
}
