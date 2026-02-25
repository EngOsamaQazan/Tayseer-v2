import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'annual', description: 'نوع الإجازة' })
  @IsNotEmpty()
  @IsString()
  leaveType: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-05' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveLeaveDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectLeaveDto {
  @ApiProperty({ description: 'سبب الرفض' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
