import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { FollowUpStatus } from './entities/follow-up.entity';

@ApiTags('Follow-Up - المتابعة')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-ups')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء متابعة جديدة' })
  create(@Body() dto: CreateFollowUpDto, @Request() req: any) {
    return this.followUpService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المتابعات' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: FollowUpStatus })
  @ApiQuery({ name: 'customerId', required: false })
  findAll(
    @Query('page') page = 1, @Query('limit') limit = 20,
    @Query('status') status: FollowUpStatus,
    @Query('customerId') customerId: number,
    @Request() req: any,
  ) {
    return this.followUpService.findAll(req.user.tenantId, +page, +limit, status, customerId ? +customerId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض متابعة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.followUpService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل متابعة' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateFollowUpDto>, @Request() req: any) {
    return this.followUpService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف متابعة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.followUpService.remove(id, req.user.tenantId);
  }
}
