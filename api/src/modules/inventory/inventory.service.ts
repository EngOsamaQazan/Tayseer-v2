import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,
  ) {}

  // --- Items ---

  async createItem(
    dto: CreateInventoryItemDto,
    tenantId: string,
    createdBy: number,
  ): Promise<InventoryItem> {
    if (dto.sku) {
      const existing = await this.itemRepo.findOne({
        where: { tenantId, sku: dto.sku, isDeleted: false },
      });
      if (existing) {
        throw new ConflictException('صنف بنفس الكود موجود بالفعل');
      }
    }

    const item = this.itemRepo.create({
      ...dto,
      tenantId,
      createdBy,
    });
    return this.itemRepo.save(item);
  }

  async findAllItems(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    categoryId?: number,
  ): Promise<{ data: InventoryItem[]; total: number }> {
    const qb = this.itemRepo
      .createQueryBuilder('i')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(i.name ILIKE :search OR i.sku ILIKE :search OR i.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (categoryId) {
      qb.andWhere('i.categoryId = :categoryId', { categoryId });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('i.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOneItem(id: number, tenantId: string): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!item) throw new NotFoundException('الصنف غير موجود');
    return item;
  }

  async updateItem(
    id: number,
    dto: Partial<CreateInventoryItemDto>,
    tenantId: string,
  ): Promise<InventoryItem> {
    const item = await this.findOneItem(id, tenantId);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async softDeleteItem(id: number, tenantId: string): Promise<void> {
    const item = await this.findOneItem(id, tenantId);
    item.isDeleted = true;
    await this.itemRepo.save(item);
  }

  async getLowStockItems(tenantId: string): Promise<InventoryItem[]> {
    return this.itemRepo
      .createQueryBuilder('i')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false')
      .andWhere('i.minStock IS NOT NULL')
      .andWhere('i.currentStock <= i.minStock')
      .orderBy('i.currentStock', 'ASC')
      .getMany();
  }

  // --- Movements ---

  async createMovement(
    dto: CreateInventoryMovementDto,
    tenantId: string,
    createdBy: number,
  ): Promise<InventoryMovement> {
    const item = await this.findOneItem(dto.itemId, tenantId);

    const movement = this.movementRepo.create({
      ...dto,
      tenantId,
      createdBy,
      totalPrice:
        dto.unitPrice && dto.quantity
          ? dto.unitPrice * dto.quantity
          : undefined,
    });
    const saved = await this.movementRepo.save(movement);

    if (dto.type === MovementType.IN || dto.type === MovementType.RETURN) {
      item.currentStock = +item.currentStock + +dto.quantity;
    } else if (dto.type === MovementType.OUT) {
      item.currentStock = +item.currentStock - +dto.quantity;
    }
    await this.itemRepo.save(item);

    return saved;
  }

  async findAllMovements(
    tenantId: string,
    page = 1,
    limit = 20,
    itemId?: number,
    type?: MovementType,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: InventoryMovement[]; total: number }> {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.item', 'item')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.isDeleted = false');

    if (itemId) qb.andWhere('m.itemId = :itemId', { itemId });
    if (type) qb.andWhere('m.type = :type', { type });
    if (dateFrom) qb.andWhere('m.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('m.date <= :dateTo', { dateTo });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('m.date', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async getItemStats(
    tenantId: string,
  ): Promise<{ totalItems: number; lowStock: number; totalValue: number }> {
    const totalItems = await this.itemRepo.count({
      where: { tenantId, isDeleted: false },
    });

    const lowStockItems = await this.getLowStockItems(tenantId);

    const result = await this.itemRepo
      .createQueryBuilder('i')
      .select('SUM(i.currentStock * i.costPrice)', 'totalValue')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false')
      .getRawOne();

    return {
      totalItems,
      lowStock: lowStockItems.length,
      totalValue: parseFloat(result?.totalValue) || 0,
    };
  }
}
