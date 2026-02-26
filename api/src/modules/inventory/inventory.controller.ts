import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { CreateItemDto, CreateMovementDto, CreateSupplierDto } from './dto/inventory.dto';

@ApiTags('Inventory - المخزون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Post('items')
  @ApiOperation({ summary: 'إضافة صنف' })
  createItem(@Body() dto: CreateItemDto, @Request() req: any) { return this.svc.createItem(dto, req.user.tenantId); }

  @Get('items')
  @ApiOperation({ summary: 'قائمة الأصناف' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  findAllItems(@Query('page') p = 1, @Query('limit') l = 20, @Request() req: any) { return this.svc.findAllItems(req.user.tenantId, +p, +l); }

  @Put('items/:id')
  @ApiOperation({ summary: 'تعديل صنف' })
  updateItem(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateItemDto>, @Request() req: any) { return this.svc.updateItem(id, dto, req.user.tenantId); }

  @Delete('items/:id')
  @ApiOperation({ summary: 'حذف صنف' })
  removeItem(@Param('id', ParseIntPipe) id: number, @Request() req: any) { return this.svc.removeItem(id, req.user.tenantId); }

  @Post('movements')
  @ApiOperation({ summary: 'تسجيل حركة مخزون' })
  createMovement(@Body() dto: CreateMovementDto, @Request() req: any) { return this.svc.createMovement(dto, req.user.tenantId, req.user.id); }

  @Get('movements')
  @ApiOperation({ summary: 'سجل حركات المخزون' })
  @ApiQuery({ name: 'itemId', required: false })
  getMovements(@Query('itemId') itemId: number, @Request() req: any) { return this.svc.getMovements(req.user.tenantId, itemId ? +itemId : undefined); }

  @Post('suppliers')
  @ApiOperation({ summary: 'إضافة مورد' })
  createSupplier(@Body() dto: CreateSupplierDto, @Request() req: any) { return this.svc.createSupplier(dto, req.user.tenantId); }

  @Get('suppliers')
  @ApiOperation({ summary: 'قائمة الموردين' })
  findAllSuppliers(@Request() req: any) { return this.svc.findAllSuppliers(req.user.tenantId); }

  @Put('suppliers/:id')
  @ApiOperation({ summary: 'تعديل مورد' })
  updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSupplierDto>, @Request() req: any) { return this.svc.updateSupplier(id, dto, req.user.tenantId); }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'حذف مورد' })
  removeSupplier(@Param('id', ParseIntPipe) id: number, @Request() req: any) { return this.svc.removeSupplier(id, req.user.tenantId); }
}
