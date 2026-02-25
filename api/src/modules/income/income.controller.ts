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
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';

@ApiTags('Income - الدفعات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة دفعة جديدة' })
  create(@Body() dto: CreateIncomeDto, @Request() req: any) {
    return this.incomeService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الدفعات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('contractId') contractId?: string,
    @Query('customerId') customerId?: string,
    @Query('companyId') companyId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any,
  ) {
    return this.incomeService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      search,
      contractId ? +contractId : undefined,
      customerId ? +customerId : undefined,
      companyId ? +companyId : undefined,
      fromDate,
      toDate,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'بحث سريع عن دفعة' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string, @Request() req: any) {
    return this.incomeService.search(query, req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الدفعات' })
  getStats(@Request() req: any) {
    return this.incomeService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض دفعة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.incomeService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل دفعة' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateIncomeDto>,
    @Request() req: any,
  ) {
    return this.incomeService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف دفعة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.incomeService.softDelete(id, req.user.tenantId, req.user.id);
  }
}
