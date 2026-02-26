import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionStatus } from './entities/collection.entity';

@ApiTags('Collections - التحصيل')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly svc: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء سجل تحصيل جديد مع أقساط' })
  create(@Body() dto: CreateCollectionDto, @Request() req: any) {
    return this.svc.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة التحصيلات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: CollectionStatus })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status: CollectionStatus, @Request() req: any) {
    return this.svc.findAll(req.user.tenantId, +page, +limit, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض تفاصيل تحصيل مع الأقساط' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.findOne(id, req.user.tenantId);
  }

  @Post('installments/:id/pay')
  @ApiOperation({ summary: 'تسجيل دفعة على قسط تحصيل' })
  pay(@Param('id', ParseIntPipe) id: number, @Body('amount') amount: number, @Request() req: any) {
    return this.svc.payInstallment(id, amount, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف سجل تحصيل' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.remove(id, req.user.tenantId);
  }
}
