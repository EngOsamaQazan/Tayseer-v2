import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, CustomerAddress, CustomerPhone } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto, tenantId: string, userId: number): Promise<Customer> {
    const existing = await this.customerRepo.findOne({
      where: { idNumber: dto.idNumber, tenantId, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('عميل بنفس رقم الهوية موجود بالفعل');
    }

    const { addresses, phoneNumbers, ...customerData } = dto;
    const customer = this.customerRepo.create({
      ...customerData,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
      addresses: addresses?.map((a) => ({ ...a, tenantId })),
      phoneNumbers: phoneNumbers?.map((p) => ({ ...p, tenantId })),
    });
    return this.customerRepo.save(customer);
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string): Promise<{ data: Customer[]; total: number }> {
    const qb = this.customerRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.addresses', 'addr', 'addr.isDeleted = false')
      .leftJoinAndSelect('c.phoneNumbers', 'phone', 'phone.isDeleted = false')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(c.name ILIKE :search OR c.idNumber ILIKE :search OR c.primaryPhoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['addresses', 'phoneNumbers'],
    });
    if (!customer) throw new NotFoundException('العميل غير موجود');
    return customer;
  }

  async update(id: number, dto: Partial<CreateCustomerDto>, tenantId: string, userId: number): Promise<Customer> {
    const customer = await this.findOne(id, tenantId);
    Object.assign(customer, { ...dto, lastUpdatedBy: userId });
    return this.customerRepo.save(customer);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const customer = await this.findOne(id, tenantId);
    customer.isDeleted = true;
    await this.customerRepo.save(customer);
  }

  async search(query: string, tenantId: string): Promise<Customer[]> {
    return this.customerRepo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .andWhere(
        '(c.name ILIKE :q OR c.idNumber ILIKE :q OR c.primaryPhoneNumber ILIKE :q)',
        { q: `%${query}%` },
      )
      .take(20)
      .getMany();
  }

  async getStats(tenantId: string): Promise<{ total: number }> {
    const total = await this.customerRepo.count({ where: { tenantId, isDeleted: false } });
    return { total };
  }
}
