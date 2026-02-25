import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractStatusDto, QueryContractsDto } from './dto/create-contract.dto';
import { ContractStatus } from './entities/contract.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contracts - العقود')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عقد جديد مع الأطراف والبنود' })
  create(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.contractsService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة العقود' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() query: QueryContractsDto,
    @Request() req: any,
  ) {
    return this.contractsService.findAll(req.user.tenantId, query, +page, +limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات العقود' })
  getStats(@Request() req: any) {
    return this.contractsService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض عقد مع التفاصيل' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.findOne(id, req.user.tenantId);
  }

  @Get(':id/installments')
  @ApiOperation({ summary: 'أقساط العقد' })
  getInstallments(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.getInstallments(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل عقد' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateContractDto>,
    @Request() req: any,
  ) {
    return this.contractsService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'تغيير حالة العقد' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractStatusDto,
    @Request() req: any,
  ) {
    return this.contractsService.updateStatus(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عقد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.softDelete(id, req.user.tenantId);
  }
}
