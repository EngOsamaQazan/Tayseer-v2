import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractStatus } from './entities/contract.entity';

@ApiTags('Contracts - العقود')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عقد جديد مع أقساط' })
  create(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.contractsService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة العقود' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status: ContractStatus,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.contractsService.findAll(req.user.tenantId, +page, +limit, status, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض تفاصيل عقد مع الأقساط' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل عقد' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateContractDto>, @Request() req: any) {
    return this.contractsService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عقد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.remove(id, req.user.tenantId);
  }

  @Post('installments/:id/pay')
  @ApiOperation({ summary: 'تسجيل دفعة على قسط' })
  payInstallment(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount: number,
    @Request() req: any,
  ) {
    return this.contractsService.payInstallment(id, amount, req.user.tenantId);
  }
}
