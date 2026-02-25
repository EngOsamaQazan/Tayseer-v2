import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JudiciaryService } from './judiciary.service';
import { CreateJudiciaryCaseDto } from './dto/create-judiciary-case.dto';
import { CaseStatus } from './entities/judiciary-case.entity';

@ApiTags('Judiciary - القضايا')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('judiciary')
export class JudiciaryController {
  constructor(private readonly judiciaryService: JudiciaryService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء قضية جديدة' })
  create(@Body() dto: CreateJudiciaryCaseDto, @Request() req: any) {
    return this.judiciaryService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة القضايا' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: CaseStatus })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1, @Query('limit') limit = 20,
    @Query('status') status: CaseStatus, @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.judiciaryService.findAll(req.user.tenantId, +page, +limit, status, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض قضية' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.judiciaryService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل قضية' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateJudiciaryCaseDto>, @Request() req: any) {
    return this.judiciaryService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف قضية' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.judiciaryService.remove(id, req.user.tenantId);
  }
}
