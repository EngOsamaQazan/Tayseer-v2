import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, CollectionStatus, CollectionInstallment, CInstallmentStatus } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private readonly collRepo: Repository<Collection>,
    @InjectRepository(CollectionInstallment) private readonly instRepo: Repository<CollectionInstallment>,
  ) {}

  async create(dto: CreateCollectionDto, tenantId: string, userId: number) {
    const coll = this.collRepo.create({
      customerId: dto.customerId, contractId: dto.contractId,
      totalAmount: dto.totalAmount, remainingAmount: dto.totalAmount,
      notes: dto.notes, assignedTo: dto.assignedTo,
      tenantId, createdBy: userId,
    });
    const saved = await this.collRepo.save(coll);

    const installments: Partial<CollectionInstallment>[] = [];
    const start = new Date(dto.firstDueDate);
    for (let i = 0; i < dto.installmentCount; i++) {
      const d = new Date(start); d.setMonth(d.getMonth() + i);
      installments.push({
        tenantId, collectionId: saved.id, installmentNumber: i + 1,
        amount: dto.installmentAmount, paidAmount: 0,
        dueDate: d.toISOString().split('T')[0], status: CInstallmentStatus.PENDING,
      });
    }
    await this.instRepo.save(installments);
    return this.findOne(saved.id, tenantId);
  }

  async findAll(tenantId: string, page = 1, limit = 20, status?: CollectionStatus) {
    const qb = this.collRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'cust')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');
    if (status) qb.andWhere('c.status = :status', { status });
    const total = await qb.getCount();
    const data = await qb.orderBy('c.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: string) {
    const c = await this.collRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['customer', 'installments'],
    });
    if (!c) throw new NotFoundException('سجل التحصيل غير موجود');
    if (c.installments) c.installments = c.installments.filter(i => !i.isDeleted).sort((a, b) => a.installmentNumber - b.installmentNumber);
    return c;
  }

  async payInstallment(instId: number, amount: number, tenantId: string) {
    const inst = await this.instRepo.findOne({ where: { id: instId, tenantId, isDeleted: false } });
    if (!inst) throw new NotFoundException('القسط غير موجود');
    inst.paidAmount = Number(inst.paidAmount) + amount;
    inst.paidDate = new Date().toISOString().split('T')[0];
    inst.status = inst.paidAmount >= Number(inst.amount) ? CInstallmentStatus.PAID : CInstallmentStatus.PARTIAL;
    await this.instRepo.save(inst);

    const coll = await this.collRepo.findOne({ where: { id: inst.collectionId, tenantId } });
    if (coll) {
      coll.collectedAmount = Number(coll.collectedAmount) + amount;
      coll.remainingAmount = Number(coll.totalAmount) - Number(coll.collectedAmount);
      if (coll.remainingAmount <= 0) coll.status = CollectionStatus.COMPLETED;
      await this.collRepo.save(coll);
    }
    return inst;
  }

  async remove(id: number, tenantId: string) {
    const c = await this.findOne(id, tenantId);
    c.isDeleted = true;
    return this.collRepo.save(c);
  }
}
