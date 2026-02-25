import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import {
  FinancialReportQueryDto,
  CustomerReportQueryDto,
} from './dto/report-query.dto';

@ApiTags('Reports - التقارير')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'تقرير مالي مع تجميع حسب الفترة أو الفئة' })
  getFinancialReport(
    @Query() query: FinancialReportQueryDto,
    @Request() req: any,
  ) {
    return this.reportsService.getFinancialReport(req.user.tenantId, query);
  }

  @Get('income-vs-expense')
  @ApiOperation({ summary: 'تقرير مقارنة الدخل بالمصاريف الشهري' })
  getIncomeVsExpense(
    @Query() query: FinancialReportQueryDto,
    @Request() req: any,
  ) {
    return this.reportsService.getIncomeVsExpenseReport(
      req.user.tenantId,
      query,
    );
  }

  @Get('customers')
  @ApiOperation({ summary: 'تقرير العملاء حسب المدينة والتسجيل' })
  getCustomerReport(
    @Query() query: CustomerReportQueryDto,
    @Request() req: any,
  ) {
    return this.reportsService.getCustomerReport(req.user.tenantId, query);
  }

  @Get('audit')
  @ApiOperation({ summary: 'تقرير سجل العمليات' })
  getAuditReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    return this.reportsService.getAuditReport(
      req.user.tenantId,
      startDate,
      endDate,
    );
  }
}
