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
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory - Purchase Orders - أوامر الشراء')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء أمر شراء' })
  create(@Body() dto: CreatePurchaseOrderDto, @Request() req: any) {
    return this.poService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة أوامر الشراء' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('supplierId') supplierId: number,
    @Query('status') status: string,
    @Request() req: any,
  ) {
    return this.poService.findAll(
      req.user.tenantId,
      +page,
      +limit,
      supplierId ? +supplierId : undefined,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض أمر شراء' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.poService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل أمر شراء' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePurchaseOrderDto>,
    @Request() req: any,
  ) {
    return this.poService.update(id, dto, req.user.tenantId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'اعتماد أمر شراء' })
  approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.poService.approve(id, req.user.tenantId, req.user.id);
  }

  @Put(':id/receive')
  @ApiOperation({ summary: 'استلام أمر شراء' })
  receive(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.poService.receive(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف أمر شراء' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.poService.softDelete(id, req.user.tenantId);
  }
}
