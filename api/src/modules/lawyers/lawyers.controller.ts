import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LawyersService } from './lawyers.service';
import { CreateLawyerDto } from './dto/create-lawyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lawyers - المحامون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة محامي' })
  create(@Body() dto: CreateLawyerDto, @Request() req: any) {
    return this.lawyersService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المحامين' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly: string, @Request() req: any) {
    return this.lawyersService.findAll(req.user.tenantId, activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض محامي' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.lawyersService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل محامي' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLawyerDto>, @Request() req: any) {
    return this.lawyersService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف محامي' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.lawyersService.softDelete(id, req.user.tenantId);
  }
}
