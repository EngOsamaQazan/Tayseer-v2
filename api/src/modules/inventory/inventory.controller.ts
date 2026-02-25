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
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { MovementType } from './entities/inventory-movement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory - Items - أصناف المخزون')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- Items ---

  @Post('items')
  @ApiOperation({ summary: 'إضافة صنف جديد' })
  createItem(@Body() dto: CreateInventoryItemDto, @Request() req: any) {
    return this.inventoryService.createItem(
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get('items')
  @ApiOperation({ summary: 'قائمة الأصناف' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAllItems(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search: string,
    @Query('categoryId') categoryId: number,
    @Request() req: any,
  ) {
    return this.inventoryService.findAllItems(
      req.user.tenantId,
      +page,
      +limit,
      search,
      categoryId ? +categoryId : undefined,
    );
  }

  @Get('items/low-stock')
  @ApiOperation({ summary: 'أصناف تحت الحد الأدنى' })
  getLowStock(@Request() req: any) {
    return this.inventoryService.getLowStockItems(req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المخزون' })
  getStats(@Request() req: any) {
    return this.inventoryService.getItemStats(req.user.tenantId);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'عرض صنف' })
  findOneItem(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inventoryService.findOneItem(id, req.user.tenantId);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'تعديل صنف' })
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateInventoryItemDto>,
    @Request() req: any,
  ) {
    return this.inventoryService.updateItem(id, dto, req.user.tenantId);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'حذف صنف' })
  removeItem(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inventoryService.softDeleteItem(id, req.user.tenantId);
  }

  // --- Movements ---

  @Post('movements')
  @ApiOperation({ summary: 'إضافة حركة مخزون (إدخال/إخراج/تحويل/تسوية)' })
  createMovement(@Body() dto: CreateInventoryMovementDto, @Request() req: any) {
    return this.inventoryService.createMovement(
      dto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get('movements')
  @ApiOperation({ summary: 'قائمة حركات المخزون' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'itemId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: MovementType })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAllMovements(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('itemId') itemId: number,
    @Query('type') type: MovementType,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Request() req: any,
  ) {
    return this.inventoryService.findAllMovements(
      req.user.tenantId,
      +page,
      +limit,
      itemId ? +itemId : undefined,
      type,
      dateFrom,
      dateTo,
    );
  }
}
