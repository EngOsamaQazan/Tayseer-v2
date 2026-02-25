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
import { PayrollService } from './payroll.service';
import {
  CreatePayrollRunDto,
  UpdatePayrollRunDto,
} from './dto/create-payroll-run.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR - Payroll - الرواتب')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مسير رواتب جديد' })
  create(@Body() dto: CreatePayrollRunDto, @Request() req: any) {
    return this.payrollService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة مسيرات الرواتب' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Request() req: any,
  ) {
    return this.payrollService.findAll(req.user.tenantId, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض مسير رواتب' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.payrollService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل مسير رواتب' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollRunDto,
    @Request() req: any,
  ) {
    return this.payrollService.update(id, dto, req.user.tenantId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'اعتماد مسير رواتب' })
  approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.payrollService.approve(id, req.user.tenantId, req.user.id);
  }

  @Put(':id/lock')
  @ApiOperation({ summary: 'قفل مسير رواتب' })
  lock(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.payrollService.lock(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مسير رواتب' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.payrollService.softDelete(id, req.user.tenantId);
  }
}
