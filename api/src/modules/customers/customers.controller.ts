import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers - العملاء')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة عميل جديد' })
  create(@Body() dto: CreateCustomerDto, @Request() req: any) {
    return this.customersService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة العملاء' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search: string, @Request() req: any) {
    return this.customersService.findAll(req.user.tenantId, +page, +limit, search);
  }

  @Get('search')
  @ApiOperation({ summary: 'بحث عن عميل' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string, @Request() req: any) {
    return this.customersService.search(query, req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات العملاء' })
  getStats(@Request() req: any) {
    return this.customersService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض عميل' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.customersService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل عميل' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCustomerDto>, @Request() req: any) {
    return this.customersService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عميل' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.customersService.softDelete(id, req.user.tenantId);
  }
}
