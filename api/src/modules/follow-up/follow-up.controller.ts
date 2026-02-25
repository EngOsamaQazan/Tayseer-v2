import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto, QueryFollowUpDto } from './dto/create-follow-up.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Follow-Up - المتابعة')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-up')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة سجل متابعة' })
  create(@Body() dto: CreateFollowUpDto, @Request() req: any) {
    return this.followUpService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المتابعات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() query: QueryFollowUpDto,
    @Request() req: any,
  ) {
    return this.followUpService.findAll(req.user.tenantId, query, +page, +limit);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'التذكيرات المستحقة' })
  getReminders(@Request() req: any) {
    return this.followUpService.getReminders(req.user.tenantId, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المتابعة' })
  getStats(@Request() req: any) {
    return this.followUpService.getStats(req.user.tenantId);
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'متابعات عقد محدد' })
  findByContract(@Param('contractId', ParseIntPipe) contractId: number, @Request() req: any) {
    return this.followUpService.findByContract(contractId, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض سجل متابعة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.followUpService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل سجل متابعة' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateFollowUpDto>, @Request() req: any) {
    return this.followUpService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف سجل متابعة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.followUpService.softDelete(id, req.user.tenantId);
  }
}
