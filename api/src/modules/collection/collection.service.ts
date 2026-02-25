import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, CollectionInstallment } from './entities/collection.entity';
import {
  CreateCollectionDto, UpdateCollectionStatusDto, QueryCollectionDto,
} from './dto/create-collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionInstallment)
    private readonly installmentRepo: Repository<CollectionInstallment>,
  ) {}

  async create(dto: CreateCollectionDto, tenantId: string, userId: number): Promise<Collection> {
    const { installments, ...collectionData } = dto;
    const collection = this.collectionRepo.create({
      ...collectionData,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
      installments: installments?.map((inst) => ({
        ...inst,
        tenantId,
        createdBy: userId,
        lastUpdatedBy: userId,
      })),
    });
    return this.collectionRepo.save(collection);
  }

  async findAll(
    tenantId: string,
    query: QueryCollectionDto,
    page = 1,
    limit = 20,
  ): Promise<{ data: Collection[]; total: number }> {
    const qb = this.collectionRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.installments', 'inst', 'inst.isDeleted = false')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (query.contractId) qb.andWhere('c.contractId = :contractId', { contractId: query.contractId });
    if (query.customerId) qb.andWhere('c.customerId = :customerId', { customerId: query.customerId });
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['installments'],
    });
    if (!collection) throw new NotFoundException('سجل التحصيل غير موجود');
    return collection;
  }

  async update(id: number, dto: Partial<CreateCollectionDto>, tenantId: string, userId: number): Promise<Collection> {
    const collection = await this.findOne(id, tenantId);
    const { installments, ...updateData } = dto;
    Object.assign(collection, { ...updateData, lastUpdatedBy: userId });
    return this.collectionRepo.save(collection);
  }

  async updateStatus(id: number, dto: UpdateCollectionStatusDto, tenantId: string, userId: number): Promise<Collection> {
    const collection = await this.findOne(id, tenantId);
    collection.status = dto.status;
    collection.lastUpdatedBy = userId;
    return this.collectionRepo.save(collection);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const collection = await this.findOne(id, tenantId);
    collection.isDeleted = true;
    await this.collectionRepo.save(collection);
  }

  async getInstallments(collectionId: number, tenantId: string): Promise<CollectionInstallment[]> {
    await this.findOne(collectionId, tenantId);
    return this.installmentRepo.find({
      where: { collectionId, tenantId, isDeleted: false },
      order: { year: 'ASC', month: 'ASC' },
    });
  }

  async getStats(tenantId: string): Promise<any> {
    const total = await this.collectionRepo.count({ where: { tenantId, isDeleted: false } });

    const totals = await this.collectionRepo.createQueryBuilder('c')
      .select('SUM(c.totalAmount)', 'totalAmount')
      .addSelect('SUM(c.paidAmount)', 'paidAmount')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .getRawOne();

    return {
      total,
      totalAmount: parseFloat(totals?.totalAmount) || 0,
      paidAmount: parseFloat(totals?.paidAmount) || 0,
      remainingAmount: (parseFloat(totals?.totalAmount) || 0) - (parseFloat(totals?.paidAmount) || 0),
    };
  }
}
