import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JudiciaryService } from './judiciary.service';
import {
  CreateJudiciaryCaseDto, CreateJudiciaryActionDto,
  UpdateCaseStatusDto, QueryJudiciaryDto,
} from './dto/create-judiciary.dto';
import { CaseStatus } from './entities/judiciary.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Judiciary - القضايا')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('judiciary')
export class JudiciaryController {
  constructor(private readonly judiciaryService: JudiciaryService) {}

  @Post('cases')
  @ApiOperation({ summary: 'إنشاء قضية' })
  createCase(@Body() dto: CreateJudiciaryCaseDto, @Request() req: any) {
    return this.judiciaryService.createCase(dto, req.user.tenantId, req.user.id);
  }

  @Get('cases')
  @ApiOperation({ summary: 'قائمة القضايا' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'caseStatus', required: false, enum: CaseStatus })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'courtId', required: false })
  @ApiQuery({ name: 'lawyerId', required: false })
  findAllCases(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() query: QueryJudiciaryDto,
    @Request() req: any,
  ) {
    return this.judiciaryService.findAllCases(req.user.tenantId, query, +page, +limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات القضايا' })
  getStats(@Request() req: any) {
    return this.judiciaryService.getStats(req.user.tenantId);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'عرض قضية مع الإجراءات' })
  findOneCase(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.judiciaryService.findOneCase(id, req.user.tenantId);
  }

  @Put('cases/:id')
  @ApiOperation({ summary: 'تعديل قضية' })
  updateCase(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateJudiciaryCaseDto>, @Request() req: any) {
    return this.judiciaryService.updateCase(id, dto, req.user.tenantId, req.user.id);
  }

  @Put('cases/:id/status')
  @ApiOperation({ summary: 'تغيير حالة القضية' })
  updateCaseStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCaseStatusDto, @Request() req: any) {
    return this.judiciaryService.updateCaseStatus(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete('cases/:id')
  @ApiOperation({ summary: 'حذف قضية' })
  deleteCase(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.judiciaryService.softDeleteCase(id, req.user.tenantId);
  }

  @Post('actions')
  @ApiOperation({ summary: 'إضافة إجراء قضائي' })
  createAction(@Body() dto: CreateJudiciaryActionDto, @Request() req: any) {
    return this.judiciaryService.createAction(dto, req.user.tenantId, req.user.id);
  }

  @Get('cases/:caseId/actions')
  @ApiOperation({ summary: 'إجراءات قضية محددة' })
  findCaseActions(@Param('caseId', ParseIntPipe) caseId: number, @Request() req: any) {
    return this.judiciaryService.findCaseActions(caseId, req.user.tenantId);
  }

  @Put('actions/:id')
  @ApiOperation({ summary: 'تعديل إجراء قضائي' })
  updateAction(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateJudiciaryActionDto>, @Request() req: any) {
    return this.judiciaryService.updateAction(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete('actions/:id')
  @ApiOperation({ summary: 'حذف إجراء قضائي' })
  deleteAction(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.judiciaryService.softDeleteAction(id, req.user.tenantId);
  }
}
