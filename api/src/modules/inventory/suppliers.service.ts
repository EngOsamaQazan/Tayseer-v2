import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async create(
    dto: CreateSupplierDto,
    tenantId: string,
    createdBy: number,
  ): Promise<Supplier> {
    const supplier = this.supplierRepo.create({
      ...dto,
      tenantId,
      createdBy,
      status: dto.status || 'active',
    });
    return this.supplierRepo.save(supplier);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ data: Supplier[]; total: number }> {
    const qb = this.supplierRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(s.name ILIKE :search OR s.phone ILIKE :search OR s.contactPerson ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!supplier) throw new NotFoundException('المورد غير موجود');
    return supplier;
  }

  async update(
    id: number,
    dto: Partial<CreateSupplierDto>,
    tenantId: string,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id, tenantId);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const supplier = await this.findOne(id, tenantId);
    supplier.isDeleted = true;
    await this.supplierRepo.save(supplier);
  }
}
