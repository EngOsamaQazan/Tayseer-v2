import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import {
  CreateNotificationDto,
  BulkNotificationDto,
} from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async create(
    dto: CreateNotificationDto,
    tenantId: string,
    createdBy?: number,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({
      ...dto,
      tenantId,
      createdBy,
    });
    return this.notifRepo.save(notif);
  }

  async bulkCreate(
    dto: BulkNotificationDto,
    tenantId: string,
    createdBy?: number,
  ): Promise<{ created: number }> {
    const notifications = dto.userIds.map((userId) =>
      this.notifRepo.create({
        userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        metadata: dto.metadata,
        tenantId,
        createdBy,
      }),
    );
    await this.notifRepo.save(notifications);
    return { created: notifications.length };
  }

  async findMyNotifications(
    tenantId: string,
    userId: number,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const qb = this.notifRepo
      .createQueryBuilder('n')
      .where('n.tenantId = :tenantId', { tenantId })
      .andWhere('n.userId = :userId', { userId })
      .andWhere('n.isDeleted = false');

    if (unreadOnly) {
      qb.andWhere('n.isRead = false');
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const unreadCount = await this.notifRepo.count({
      where: { tenantId, userId, isRead: false, isDeleted: false },
    });

    return { data, total, unreadCount };
  }

  async markAsRead(
    id: number,
    tenantId: string,
    userId: number,
  ): Promise<Notification> {
    const notif = await this.notifRepo.findOne({
      where: { id, tenantId, userId, isDeleted: false },
    });
    if (!notif) throw new NotFoundException('الإشعار غير موجود');

    notif.isRead = true;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(
    tenantId: string,
    userId: number,
  ): Promise<{ updated: number }> {
    const result = await this.notifRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('userId = :userId', { userId })
      .andWhere('isRead = false')
      .andWhere('isDeleted = false')
      .execute();

    return { updated: result.affected || 0 };
  }

  async softDelete(
    id: number,
    tenantId: string,
    userId: number,
  ): Promise<void> {
    const notif = await this.notifRepo.findOne({
      where: { id, tenantId, userId, isDeleted: false },
    });
    if (!notif) throw new NotFoundException('الإشعار غير موجود');
    notif.isDeleted = true;
    await this.notifRepo.save(notif);
  }

  async getUnreadCount(
    tenantId: string,
    userId: number,
  ): Promise<{ count: number }> {
    const count = await this.notifRepo.count({
      where: { tenantId, userId, isRead: false, isDeleted: false },
    });
    return { count };
  }
}
