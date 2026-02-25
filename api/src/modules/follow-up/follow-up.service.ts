import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp, FollowUpStatus } from './entities/follow-up.entity';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private readonly followUpRepo: Repository<FollowUp>,
  ) {}

  async create(dto: CreateFollowUpDto, tenantId: string, userId: number) {
    const followUp = this.followUpRepo.create({ ...dto, tenantId, createdBy: userId });
    return this.followUpRepo.save(followUp);
  }

  async findAll(tenantId: string, page = 1, limit = 20, status?: FollowUpStatus, customerId?: number) {
    const qb = this.followUpRepo.createQueryBuilder('f')
      .leftJoinAndSelect('f.customer', 'cust')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.isDeleted = false');

    if (status) qb.andWhere('f.status = :status', { status });
    if (customerId) qb.andWhere('f.customerId = :customerId', { customerId });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('f.followUpDate', 'ASC')
      .skip((page - 1) * limit).take(limit).getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: string) {
    const f = await this.followUpRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['customer'],
    });
    if (!f) throw new NotFoundException('المتابعة غير موجودة');
    return f;
  }

  async update(id: number, dto: Partial<CreateFollowUpDto>, tenantId: string) {
    const f = await this.findOne(id, tenantId);
    Object.assign(f, dto);
    return this.followUpRepo.save(f);
  }

  async remove(id: number, tenantId: string) {
    const f = await this.findOne(id, tenantId);
    f.isDeleted = true;
    return this.followUpRepo.save(f);
  }
}
