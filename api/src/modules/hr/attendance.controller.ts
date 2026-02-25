import {
  Controller,
  Get,
  Post,
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
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  ClockInDto,
  ClockOutDto,
} from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR - Attendance - الحضور والانصراف')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة سجل حضور يدوي' })
  create(@Body() dto: CreateAttendanceDto, @Request() req: any) {
    return this.attendanceService.create(dto, req.user.tenantId, req.user.id);
  }

  @Post('clock-in')
  @ApiOperation({ summary: 'تسجيل حضور (مع موقع اختياري)' })
  clockIn(@Body() dto: ClockInDto, @Request() req: any) {
    return this.attendanceService.clockIn(
      req.user.id,
      req.user.tenantId,
      dto.location,
      dto.notes,
    );
  }

  @Post('clock-out')
  @ApiOperation({ summary: 'تسجيل انصراف' })
  clockOut(@Body() dto: ClockOutDto, @Request() req: any) {
    return this.attendanceService.clockOut(
      req.user.id,
      req.user.tenantId,
      dto.location,
      dto.notes,
    );
  }

  @Get()
  @ApiOperation({ summary: 'قائمة سجلات الحضور' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId: number,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Request() req: any,
  ) {
    return this.attendanceService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      userId ? +userId : undefined,
      dateFrom,
      dateTo,
    );
  }

  @Get('summary/:userId/:month')
  @ApiOperation({ summary: 'ملخص حضور شهري لموظف (YYYY-MM)' })
  getSummary(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('month') month: string,
    @Request() req: any,
  ) {
    return this.attendanceService.getSummary(req.user.tenantId, userId, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض سجل حضور' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.attendanceService.findOne(id, req.user.tenantId);
  }
}
