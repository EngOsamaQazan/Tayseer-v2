import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import {
  CreateCollectionDto, UpdateCollectionStatusDto, QueryCollectionDto,
} from './dto/create-collection.dto';
import { CollectionStatus } from './entities/collection.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Collection - التحصيل')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء سجل تحصيل مع أقساط' })
  create(@Body() dto: CreateCollectionDto, @Request() req: any) {
    return this.collectionService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة التحصيلات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: CollectionStatus })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() query: QueryCollectionDto,
    @Request() req: any,
  ) {
    return this.collectionService.findAll(req.user.tenantId, query, +page, +limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات التحصيل' })
  getStats(@Request() req: any) {
    return this.collectionService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض سجل تحصيل' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.collectionService.findOne(id, req.user.tenantId);
  }

  @Get(':id/installments')
  @ApiOperation({ summary: 'أقساط التحصيل' })
  getInstallments(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.collectionService.getInstallments(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل سجل تحصيل' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCollectionDto>, @Request() req: any) {
    return this.collectionService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'تغيير حالة التحصيل' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollectionStatusDto, @Request() req: any) {
    return this.collectionService.updateStatus(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف سجل تحصيل' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.collectionService.softDelete(id, req.user.tenantId);
  }
}
