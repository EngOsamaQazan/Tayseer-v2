import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import {
  CreateFinancialTransactionDto,
  UpdateFinancialTransactionDto,
} from './dto/create-financial-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  TransactionType,
  TransactionCategory,
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
  @ApiOperation({ summary: 'إنشاء حركة مالية جديدة' })
  create(
    @Body() dto: CreateFinancialTransactionDto,
    @Request() req: any,
  ) {
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
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'category', enum: TransactionCategory, required: false })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type: TransactionType,
    @Query('category') category: TransactionCategory,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      type,
      category,
      dateFrom,
      dateTo,
      search,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'ملخص مالي (إيرادات، مصروفات، صافي)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'YYYY-MM-DD' })
  getSummary(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.getSummary(
      req.user.tenantId,
      dateFrom,
      dateTo,
    );
  }

  @Get('by-contract/:contractId')
  @ApiOperation({ summary: 'حركات مالية لعقد محدد' })
  getByContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.getByContract(
      contractId,
      req.user.tenantId,
    );
  }

  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'حركات مالية لمستثمر محدد' })
  getByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.getByCompany(
      companyId,
      req.user.tenantId,
    );
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
    @Body() dto: UpdateFinancialTransactionDto,
    @Request() req: any,
  ) {
    return this.financialTransactionsService.update(
      id,
      dto,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف حركة مالية' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.financialTransactionsService.softDelete(
      id,
      req.user.tenantId,
    );
  }
}
