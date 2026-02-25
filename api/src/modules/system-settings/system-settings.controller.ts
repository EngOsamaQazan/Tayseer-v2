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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@ApiTags('System Settings - إعدادات النظام')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الإعدادات (مع فلتر اختياري حسب التصنيف)' })
  findAll(@Query('category') category: string, @Request() req: any) {
    return this.settingsService.findAll(req.user.tenantId, category);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'عرض إعداد حسب المفتاح' })
  findByKey(@Param('key') key: string, @Request() req: any) {
    return this.settingsService.findByKey(req.user.tenantId, key);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة إعداد جديد' })
  create(@Body() dto: CreateSystemSettingDto, @Request() req: any) {
    return this.settingsService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تعديل إعداد' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSystemSettingDto,
    @Request() req: any,
  ) {
    return this.settingsService.update(id, dto, req.user.tenantId);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'إضافة أو تحديث إعداد حسب المفتاح' })
  upsert(@Body() dto: CreateSystemSettingDto, @Request() req: any) {
    return this.settingsService.upsert(dto, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إعداد' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.settingsService.remove(id, req.user.tenantId);
  }

  @Post('seed')
  @ApiOperation({ summary: 'إنشاء الإعدادات الافتراضية' })
  seed(@Request() req: any) {
    return this.settingsService.seed(req.user.tenantId);
  }
}
