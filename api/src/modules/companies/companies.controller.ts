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
    return this.companiesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المستثمرين' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.companiesService.findAll(+page, +limit);
  }

  @Get('primary')
  @ApiOperation({ summary: 'الشركة الرئيسية' })
  getPrimary() {
    return this.companiesService.getPrimaryCompany();
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض مستثمر' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل مستثمر' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCompanyDto>) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مستثمر' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.softDelete(id);
  }
}
