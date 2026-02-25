import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
  ) {}

  async create(
    dto: CreatePurchaseOrderDto,
    tenantId: string,
    createdBy: number,
  ): Promise<PurchaseOrder> {
    const po = this.poRepo.create({
      ...dto,
      tenantId,
      createdBy,
      status: 'draft',
    });
    return this.poRepo.save(po);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    supplierId?: number,
    status?: string,
  ): Promise<{ data: PurchaseOrder[]; total: number }> {
    const qb = this.poRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .where('po.tenantId = :tenantId', { tenantId })
      .andWhere('po.isDeleted = false');

    if (supplierId) qb.andWhere('po.supplierId = :supplierId', { supplierId });
    if (status) qb.andWhere('po.status = :status', { status });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('po.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['supplier'],
    });
    if (!po) throw new NotFoundException('أمر الشراء غير موجود');
    return po;
  }

  async update(
    id: number,
    dto: Partial<CreatePurchaseOrderDto>,
    tenantId: string,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(id, tenantId);
    if (po.status === 'received') {
      throw new BadRequestException('لا يمكن تعديل أمر شراء مستلم');
    }
    Object.assign(po, dto);
    return this.poRepo.save(po);
  }

  async approve(
    id: number,
    tenantId: string,
    approvedBy: number,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(id, tenantId);
    if (po.status !== 'draft') {
      throw new BadRequestException('لا يمكن اعتماد هذا الأمر');
    }
    po.status = 'approved';
    po.approvedBy = approvedBy;
    po.approvedAt = new Date();
    return this.poRepo.save(po);
  }

  async receive(id: number, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.findOne(id, tenantId);
    if (po.status !== 'approved') {
      throw new BadRequestException('يجب اعتماد الأمر أولاً');
    }
    po.status = 'received';
    po.receivedDate = new Date().toISOString().split('T')[0];
    return this.poRepo.save(po);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const po = await this.findOne(id, tenantId);
    if (po.status === 'received') {
      throw new BadRequestException('لا يمكن حذف أمر شراء مستلم');
    }
    po.isDeleted = true;
    await this.poRepo.save(po);
  }
}
