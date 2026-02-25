import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldSession } from './entities/field-session.entity';

@Injectable()
export class FieldSessionsService {
  constructor(
    @InjectRepository(FieldSession)
    private readonly sessionRepo: Repository<FieldSession>,
  ) {}

  async startSession(
    tenantId: string,
    userId: number,
    deviceInfo?: Record<string, any>,
    startLocation?: Record<string, any>,
  ): Promise<FieldSession> {
    const active = await this.sessionRepo.findOne({
      where: { tenantId, userId, status: 'active', isDeleted: false },
    });
    if (active) {
      throw new BadRequestException('يوجد جلسة ميدانية نشطة بالفعل');
    }

    const session = this.sessionRepo.create({
      tenantId,
      userId,
      startTime: new Date(),
      status: 'active',
      deviceInfo,
      locationPoints: startLocation
        ? [{ ...startLocation, ts: Date.now() }]
        : [],
      events: [],
      createdBy: userId,
    });
    return this.sessionRepo.save(session);
  }

  async endSession(
    id: number,
    tenantId: string,
    userId: number,
    endLocation?: Record<string, any>,
  ): Promise<FieldSession> {
    const session = await this.sessionRepo.findOne({
      where: { id, tenantId, userId, isDeleted: false },
    });
    if (!session) throw new NotFoundException('الجلسة غير موجودة');
    if (session.status !== 'active') {
      throw new BadRequestException('الجلسة ليست نشطة');
    }

    session.endTime = new Date();
    session.status = 'completed';
    if (endLocation) {
      const points = session.locationPoints || [];
      points.push({ ...endLocation, ts: Date.now() });
      session.locationPoints = points;
    }
    return this.sessionRepo.save(session);
  }

  async addLocationPoints(
    id: number,
    tenantId: string,
    userId: number,
    points: Record<string, any>[],
  ): Promise<FieldSession> {
    const session = await this.sessionRepo.findOne({
      where: { id, tenantId, userId, status: 'active', isDeleted: false },
    });
    if (!session) throw new NotFoundException('الجلسة النشطة غير موجودة');

    const existing = session.locationPoints || [];
    session.locationPoints = [...existing, ...points];
    return this.sessionRepo.save(session);
  }

  async addEvent(
    id: number,
    tenantId: string,
    userId: number,
    event: Record<string, any>,
  ): Promise<FieldSession> {
    const session = await this.sessionRepo.findOne({
      where: { id, tenantId, userId, status: 'active', isDeleted: false },
    });
    if (!session) throw new NotFoundException('الجلسة النشطة غير موجودة');

    const events = session.events || [];
    events.push({ ...event, ts: Date.now() });
    session.events = events;
    return this.sessionRepo.save(session);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    userId?: number,
    status?: string,
  ): Promise<{ data: FieldSession[]; total: number }> {
    const qb = this.sessionRepo
      .createQueryBuilder('fs')
      .where('fs.tenantId = :tenantId', { tenantId })
      .andWhere('fs.isDeleted = false');

    if (userId) qb.andWhere('fs.userId = :userId', { userId });
    if (status) qb.andWhere('fs.status = :status', { status });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('fs.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<FieldSession> {
    const session = await this.sessionRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!session) throw new NotFoundException('الجلسة غير موجودة');
    return session;
  }

  async getActiveSessions(tenantId: string): Promise<FieldSession[]> {
    return this.sessionRepo.find({
      where: { tenantId, status: 'active', isDeleted: false },
      order: { startTime: 'DESC' },
    });
  }
}
