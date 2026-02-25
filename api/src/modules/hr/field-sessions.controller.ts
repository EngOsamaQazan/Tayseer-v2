import {
  Controller,
  Get,
  Post,
  Put,
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
import { FieldSessionsService } from './field-sessions.service';
import {
  StartFieldSessionDto,
  EndFieldSessionDto,
  AddLocationPointsDto,
  AddFieldEventDto,
} from './dto/create-field-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR - Field Sessions - الجلسات الميدانية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/field')
export class FieldSessionsController {
  constructor(private readonly fieldService: FieldSessionsService) {}

  @Post('session/start')
  @ApiOperation({ summary: 'بدء جلسة ميدانية' })
  startSession(@Body() dto: StartFieldSessionDto, @Request() req: any) {
    return this.fieldService.startSession(
      req.user.tenantId,
      req.user.id,
      dto.deviceInfo,
      dto.startLocation,
    );
  }

  @Put('session/:id/end')
  @ApiOperation({ summary: 'إنهاء جلسة ميدانية' })
  endSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EndFieldSessionDto,
    @Request() req: any,
  ) {
    return this.fieldService.endSession(
      id,
      req.user.tenantId,
      req.user.id,
      dto.endLocation,
    );
  }

  @Post('session/:id/locations')
  @ApiOperation({ summary: 'إضافة نقاط موقع للجلسة' })
  addLocations(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddLocationPointsDto,
    @Request() req: any,
  ) {
    return this.fieldService.addLocationPoints(
      id,
      req.user.tenantId,
      req.user.id,
      dto.points,
    );
  }

  @Post('session/:id/event')
  @ApiOperation({ summary: 'إضافة حدث ميداني' })
  addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddFieldEventDto,
    @Request() req: any,
  ) {
    return this.fieldService.addEvent(id, req.user.tenantId, req.user.id, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'قائمة الجلسات الميدانية' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId: number,
    @Query('status') status: string,
    @Request() req: any,
  ) {
    return this.fieldService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      userId ? +userId : undefined,
      status,
    );
  }

  @Get('sessions/active')
  @ApiOperation({ summary: 'الجلسات النشطة حالياً' })
  getActiveSessions(@Request() req: any) {
    return this.fieldService.getActiveSessions(req.user.tenantId);
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'عرض جلسة ميدانية' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.fieldService.findOne(id, req.user.tenantId);
  }
}
