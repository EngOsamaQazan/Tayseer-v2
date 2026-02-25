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
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
} from './dto/create-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractStatus } from './entities/contract.entity';

@ApiTags('Contracts - العقود')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عقد جديد' })
  create(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.contractsService.create(
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'قائمة العقود' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: ContractStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status: ContractStatus,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.contractsService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      status,
      search,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات العقود' })
  getStats(@Request() req: any) {
    return this.contractsService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض عقد' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل عقد' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.update(
      id,
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'تفعيل عقد (تحويل من مسودة إلى فعال)' })
  activate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.activate(
      id,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get(':id/installments')
  @ApiOperation({ summary: 'جدول أقساط العقد' })
  getInstallments(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.contractsService.getInstallments(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عقد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.softDelete(id, req.user.tenantId);
  }
}
