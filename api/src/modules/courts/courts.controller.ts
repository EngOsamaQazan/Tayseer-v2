import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Courts - المحاكم')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة محكمة' })
  create(@Body() dto: CreateCourtDto, @Request() req: any) {
    return this.courtsService.create(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المحاكم' })
  findAll(@Request() req: any) {
    return this.courtsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'عرض محكمة' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.courtsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل محكمة' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCourtDto>, @Request() req: any) {
    return this.courtsService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف محكمة' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.courtsService.softDelete(id, req.user.tenantId);
  }
}
