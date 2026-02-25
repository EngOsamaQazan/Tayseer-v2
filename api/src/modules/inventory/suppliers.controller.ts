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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory - Suppliers - الموردون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة مورد جديد' })
  create(@Body() dto: CreateSupplierDto, @Request() req: any) {
    return this.suppliersService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الموردين' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.suppliersService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض مورد' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.suppliersService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل مورد' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateSupplierDto>,
    @Request() req: any,
  ) {
    return this.suppliersService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مورد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.suppliersService.softDelete(id, req.user.tenantId);
  }
}
