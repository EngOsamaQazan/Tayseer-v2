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
import { LeaveRequestsService } from './leave-requests.service';
import {
  CreateLeaveRequestDto,
  RejectLeaveDto,
} from './dto/create-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR - Leave - الإجازات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/leave')
export class LeaveRequestsController {
  constructor(private readonly leaveService: LeaveRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'تقديم طلب إجازة' })
  create(@Body() dto: CreateLeaveRequestDto, @Request() req: any) {
    return this.leaveService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة طلبات الإجازة' })
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
    return this.leaveService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      userId ? +userId : undefined,
      status,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'طلبات إجازاتي' })
  getMyRequests(@Request() req: any) {
    return this.leaveService.getMyRequests(req.user.tenantId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض طلب إجازة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.leaveService.findOne(id, req.user.tenantId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'اعتماد طلب إجازة' })
  approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.leaveService.approve(id, req.user.tenantId, req.user.id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'رفض طلب إجازة' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectLeaveDto,
    @Request() req: any,
  ) {
    return this.leaveService.reject(
      id,
      req.user.tenantId,
      req.user.id,
      dto.rejectionReason,
    );
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'إلغاء طلب إجازة' })
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.leaveService.cancel(id, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف طلب إجازة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.leaveService.softDelete(id, req.user.tenantId);
  }
}
