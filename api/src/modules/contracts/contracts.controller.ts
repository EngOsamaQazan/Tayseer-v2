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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractStatus } from './entities/contract.entity';

@ApiTags('Contracts - العقود')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة عقد جديد' })
  create(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.contractsService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة العقود' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search: string,
    @Query('customerId') customerId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: ContractStatus,
    @Request() req?: any,
  ) {
    return this.contractsService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      search,
      customerId ? +customerId : undefined,
      companyId ? +companyId : undefined,
      status,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'بحث سريع عن عقد' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string, @Request() req: any) {
    return this.contractsService.search(query, req.user.tenantId);
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
    @Body() dto: Partial<CreateContractDto>,
    @Request() req: any,
  ) {
    return this.contractsService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عقد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contractsService.softDelete(id, req.user.tenantId);
  }
}
