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
import { IncomeService } from './income.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/create-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IncomeType } from './entities/income.entity';

@ApiTags('Income - الدفعات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'تسجيل دفعة جديدة' })
  create(@Body() dto: CreateIncomeDto, @Request() req: any) {
    return this.incomeService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الدفعات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'type', enum: IncomeType, required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('contractId') contractId: number,
    @Query('type') type: IncomeType,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.incomeService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      contractId ? +contractId : undefined,
      type,
      search,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الدفعات' })
  getStats(@Request() req: any) {
    return this.incomeService.getStats(req.user.tenantId);
  }

  @Get('by-contract/:contractId')
  @ApiOperation({ summary: 'دفعات عقد محدد' })
  getByContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Request() req: any,
  ) {
    return this.incomeService.getByContract(contractId, req.user.tenantId);
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
    @Body() dto: UpdateIncomeDto,
    @Request() req: any,
  ) {
    return this.incomeService.update(
      id,
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف دفعة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.incomeService.softDelete(id, req.user.tenantId);
  }
}
