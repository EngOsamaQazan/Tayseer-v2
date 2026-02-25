import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp } from './entities/follow-up.entity';
import { CreateFollowUpDto, QueryFollowUpDto } from './dto/create-follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private readonly followUpRepo: Repository<FollowUp>,
  ) {}

  async create(dto: CreateFollowUpDto, tenantId: string, userId: number): Promise<FollowUp> {
    const followUp = this.followUpRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });
    return this.followUpRepo.save(followUp);
  }

  async findAll(
    tenantId: string,
    query: QueryFollowUpDto,
    page = 1,
    limit = 20,
  ): Promise<{ data: FollowUp[]; total: number }> {
    const qb = this.followUpRepo.createQueryBuilder('f')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.isDeleted = false');

    if (query.contractId) qb.andWhere('f.contractId = :contractId', { contractId: query.contractId });
    if (query.createdBy) qb.andWhere('f.createdBy = :createdBy', { createdBy: query.createdBy });
    if (query.dateFrom) qb.andWhere('f.dateTime >= :dateFrom', { dateFrom: query.dateFrom });
    if (query.dateTo) qb.andWhere('f.dateTime <= :dateTo', { dateTo: query.dateTo });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('f.dateTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findByContract(contractId: number, tenantId: string): Promise<FollowUp[]> {
    return this.followUpRepo.find({
      where: { contractId, tenantId, isDeleted: false },
      order: { dateTime: 'DESC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<FollowUp> {
    const followUp = await this.followUpRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!followUp) throw new NotFoundException('سجل المتابعة غير موجود');
    return followUp;
  }

  async update(id: number, dto: Partial<CreateFollowUpDto>, tenantId: string): Promise<FollowUp> {
    const followUp = await this.findOne(id, tenantId);
    Object.assign(followUp, dto);
    return this.followUpRepo.save(followUp);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const followUp = await this.findOne(id, tenantId);
    followUp.isDeleted = true;
    await this.followUpRepo.save(followUp);
  }

  async getReminders(tenantId: string, userId: number): Promise<FollowUp[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.followUpRepo.createQueryBuilder('f')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.isDeleted = false')
      .andWhere('f.reminder IS NOT NULL')
      .andWhere('f.reminder <= :today', { today })
      .andWhere('f.createdBy = :userId', { userId })
      .orderBy('f.reminder', 'ASC')
      .getMany();
  }

  async getStats(tenantId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const total = await this.followUpRepo.count({
      where: { tenantId, isDeleted: false },
    });

    const todayCount = await this.followUpRepo.createQueryBuilder('f')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.isDeleted = false')
      .andWhere('DATE(f.dateTime) = :today', { today })
      .getCount();

    const pendingReminders = await this.followUpRepo.createQueryBuilder('f')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.isDeleted = false')
      .andWhere('f.reminder IS NOT NULL')
      .andWhere('f.reminder <= :today', { today })
      .getCount();

    return { total, todayCount, pendingReminders };
  }
}
