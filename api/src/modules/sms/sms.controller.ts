import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { CreateSmsDto, BulkSmsDto } from './dto/create-sms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('SMS - الرسائل النصية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  @ApiOperation({ summary: 'إرسال رسالة نصية' })
  create(@Body() dto: CreateSmsDto, @Request() req: any) {
    return this.smsService.create(dto, req.user.tenantId, req.user.id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'إرسال رسائل لعدة مستلمين' })
  bulkCreate(@Body() dto: BulkSmsDto, @Request() req: any) {
    return this.smsService.bulkCreate(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الرسائل' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status: string,
    @Query('type') type: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Request() req: any,
  ) {
    return this.smsService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      status,
      type,
      dateFrom,
      dateTo,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الرسائل' })
  getStats(@Request() req: any) {
    return this.smsService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض رسالة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.smsService.findOne(id, req.user.tenantId);
  }

  @Put(':id/resend')
  @ApiOperation({ summary: 'إعادة إرسال رسالة' })
  resend(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.smsService.resend(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف رسالة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.smsService.softDelete(id, req.user.tenantId);
  }
}
