import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, InventoryMovement, MovementType, Supplier } from './entities/inventory.entity';
import { CreateItemDto, CreateMovementDto, CreateSupplierDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem) private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryMovement) private readonly moveRepo: Repository<InventoryMovement>,
    @InjectRepository(Supplier) private readonly supRepo: Repository<Supplier>,
  ) {}

  async createItem(dto: CreateItemDto, tenantId: string) {
    const exists = await this.itemRepo.findOne({ where: { tenantId, sku: dto.sku, isDeleted: false } });
    if (exists) throw new ConflictException('رمز الصنف موجود مسبقاً');
    return this.itemRepo.save(this.itemRepo.create({ ...dto, tenantId }));
  }

  async findAllItems(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await this.itemRepo.findAndCount({
      where: { tenantId, isDeleted: false }, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateItem(id: number, dto: Partial<CreateItemDto>, tenantId: string) {
    const item = await this.itemRepo.findOne({ where: { id, tenantId, isDeleted: false } });
    if (!item) throw new NotFoundException('الصنف غير موجود');
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(id: number, tenantId: string) {
    const item = await this.itemRepo.findOne({ where: { id, tenantId, isDeleted: false } });
    if (!item) throw new NotFoundException('الصنف غير موجود');
    item.isDeleted = true;
    return this.itemRepo.save(item);
  }

  async createMovement(dto: CreateMovementDto, tenantId: string, userId: number) {
    const item = await this.itemRepo.findOne({ where: { id: dto.itemId, tenantId, isDeleted: false } });
    if (!item) throw new NotFoundException('الصنف غير موجود');

    if (dto.type === MovementType.IN) item.quantity += dto.quantity;
    else if (dto.type === MovementType.OUT) item.quantity -= dto.quantity;
    else item.quantity = dto.quantity;
    await this.itemRepo.save(item);

    return this.moveRepo.save(this.moveRepo.create({ ...dto, tenantId, createdBy: userId }));
  }

  async getMovements(tenantId: string, itemId?: number) {
    const qb = this.moveRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.item', 'item')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.isDeleted = false');
    if (itemId) qb.andWhere('m.itemId = :itemId', { itemId });
    return qb.orderBy('m.date', 'DESC').limit(100).getMany();
  }

  async createSupplier(dto: CreateSupplierDto, tenantId: string) {
    return this.supRepo.save(this.supRepo.create({ ...dto, tenantId }));
  }

  async findAllSuppliers(tenantId: string) {
    return this.supRepo.find({ where: { tenantId, isDeleted: false }, order: { name: 'ASC' } });
  }

  async updateSupplier(id: number, dto: Partial<CreateSupplierDto>, tenantId: string) {
    const s = await this.supRepo.findOne({ where: { id, tenantId, isDeleted: false } });
    if (!s) throw new NotFoundException('المورد غير موجود');
    Object.assign(s, dto);
    return this.supRepo.save(s);
  }

  async removeSupplier(id: number, tenantId: string) {
    const s = await this.supRepo.findOne({ where: { id, tenantId, isDeleted: false } });
    if (!s) throw new NotFoundException('المورد غير موجود');
    s.isDeleted = true;
    return this.supRepo.save(s);
  }
}
