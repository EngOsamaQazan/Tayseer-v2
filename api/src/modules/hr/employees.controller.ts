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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR - Employees - الموظفون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة موظف جديد' })
  create(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.employeesService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الموظفين' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search: string,
    @Query('department') department: string,
    @Query('status') status: string,
    @Request() req: any,
  ) {
    return this.employeesService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      search,
      department,
      status,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الموظفين' })
  getStats(@Request() req: any) {
    return this.employeesService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض موظف' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.employeesService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل موظف' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateEmployeeDto>,
    @Request() req: any,
  ) {
    return this.employeesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف موظف' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.employeesService.softDelete(id, req.user.tenantId);
  }
}
