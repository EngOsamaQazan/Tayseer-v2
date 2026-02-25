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
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  BulkNotificationDto,
} from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications - الإشعارات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'إرسال إشعار' })
  create(@Body() dto: CreateNotificationDto, @Request() req: any) {
    return this.notifService.create(dto, req.user.tenantId, req.user.id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'إرسال إشعار لعدة مستخدمين' })
  bulkCreate(@Body() dto: BulkNotificationDto, @Request() req: any) {
    return this.notifService.bulkCreate(dto, req.user.tenantId, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'إشعاراتي' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'unreadOnly', required: false })
  getMyNotifications(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('unreadOnly') unreadOnly: string,
    @Request() req: any,
  ) {
    return this.notifService.findMyNotifications(
      req.user.tenantId,
      req.user.id,
      +page,
      +limit,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'عدد الإشعارات غير المقروءة' })
  getUnreadCount(@Request() req: any) {
    return this.notifService.getUnreadCount(req.user.tenantId, req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'تعليم إشعار كمقروء' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.notifService.markAsRead(id, req.user.tenantId, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'تعليم جميع الإشعارات كمقروءة' })
  markAllAsRead(@Request() req: any) {
    return this.notifService.markAllAsRead(req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إشعار' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.notifService.softDelete(id, req.user.tenantId, req.user.id);
  }
}
