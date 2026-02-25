import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancialTransactionsService } from './financial-transactions.service';
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto';
import {
  FinancialTransactionDirection,
  FinancialTransactionType,
} from './entities/financial-transaction.entity';

@ApiTags('Financial Transactions - الحركات المالية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-transactions')
export class FinancialTransactionsController {
  constructor(
    private readonly financialTransactionsService: FinancialTransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'إضافة حركة مالية جديدة' })
  create(@Body() dto: CreateFinancialTransactionDto, @Request() req: any) {
    return this.financialTransactionsService.create(
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الحركات المالية' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: FinancialTransactionType })
  @ApiQuery({
    name: 'direction',
    required: false,
    enum: FinancialTransactionDirection,
  })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('type') type?: FinancialTransactionType,
    @Query('direction') direction?: FinancialTransactionDirection,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('contractId') contractId?: string,
    @Query('customerId') customerId?: string,
    @Query('companyId') companyId?: string,
    @Request() req?: any,
  ) {
    return this.financialTransactionsService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      search,
      type,
      direction,
      fromDate,
      toDate,
      contractId ? +contractId : undefined,
      customerId ? +customerId : undefined,
      companyId ? +companyId : undefined,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'بحث سريع عن حركة مالية' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string, @Request() req: any) {
    return this.financialTransactionsService.search(query, req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الحركات المالية' })
  getStats(@Request() req: any) {
    return this.financialTransactionsService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض حركة مالية' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.financialTransactionsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل حركة مالية' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateFinancialTransactionDto>,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.update(
      id,
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف حركة مالية' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.financialTransactionsService.softDelete(id, req.user.tenantId);
  }
}
