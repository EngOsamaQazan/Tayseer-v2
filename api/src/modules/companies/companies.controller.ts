import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Companies - المستثمرون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة مستثمر جديد' })
  create(@Body() dto: CreateCompanyDto, @Request() req: any) {
    return this.companiesService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المستثمرين' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Request() req: any) {
    return this.companiesService.findAll(req.user.tenantId, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض مستثمر' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.companiesService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل مستثمر' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCompanyDto>, @Request() req: any) {
    return this.companiesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مستثمر' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.companiesService.softDelete(id, req.user.tenantId);
  }
}
