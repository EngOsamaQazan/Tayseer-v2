import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HrService } from './hr.service';
import { CreateEmployeeDto, CreateAttendanceDto, CreatePayrollDto } from './dto/hr.dto';

@ApiTags('HR - الموارد البشرية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly svc: HrService) {}

  @Post('employees')
  @ApiOperation({ summary: 'إضافة موظف' })
  createEmployee(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.svc.createEmployee(dto, req.user.tenantId);
  }

  @Get('employees')
  @ApiOperation({ summary: 'قائمة الموظفين' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllEmployees(@Query('page') page = 1, @Query('limit') limit = 20, @Request() req: any) {
    return this.svc.findAllEmployees(req.user.tenantId, +page, +limit);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'عرض موظف' })
  findOneEmployee(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.findOneEmployee(id, req.user.tenantId);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'تعديل موظف' })
  updateEmployee(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEmployeeDto>, @Request() req: any) {
    return this.svc.updateEmployee(id, dto, req.user.tenantId);
  }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'حذف موظف' })
  removeEmployee(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.removeEmployee(id, req.user.tenantId);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'تسجيل حضور' })
  recordAttendance(@Body() dto: CreateAttendanceDto, @Request() req: any) {
    return this.svc.recordAttendance(dto, req.user.tenantId);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'سجل الحضور' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'date', required: false })
  getAttendance(@Query('employeeId') empId: number, @Query('date') date: string, @Request() req: any) {
    return this.svc.getAttendance(req.user.tenantId, empId ? +empId : undefined, date);
  }

  @Post('payroll')
  @ApiOperation({ summary: 'تشغيل مسير رواتب' })
  runPayroll(@Body() dto: CreatePayrollDto, @Request() req: any) {
    return this.svc.runPayroll(dto.month, req.user.tenantId, req.user.id);
  }

  @Get('payroll')
  @ApiOperation({ summary: 'قائمة مسيرات الرواتب' })
  getPayrollRuns(@Request() req: any) {
    return this.svc.getPayrollRuns(req.user.tenantId);
  }
}
