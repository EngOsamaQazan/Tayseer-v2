import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard - لوحة التحكم')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'ملخص لوحة التحكم الرئيسية' })
  getSummary(@Request() req: any) {
    return this.dashboardService.getSummary(req.user.tenantId);
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'ملخص مالي حسب النوع والحالة' })
  getFinancialSummary(@Request() req: any) {
    return this.dashboardService.getFinancialSummary(req.user.tenantId);
  }

  @Get('customer-stats')
  @ApiOperation({ summary: 'إحصائيات العملاء' })
  getCustomerStats(@Request() req: any) {
    return this.dashboardService.getCustomerStats(req.user.tenantId);
  }
}
