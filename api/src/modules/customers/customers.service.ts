import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer, CustomerAddress, CustomerPhone } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto, userId: number): Promise<Customer> {
    const existing = await this.customerRepo.findOne({
      where: { idNumber: dto.idNumber, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('عميل بنفس رقم الهوية موجود بالفعل');
    }

    const customer = this.customerRepo.create({
      ...dto,
      createdBy: userId,
      lastUpdatedBy: userId,
    });
    return this.customerRepo.save(customer);
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ data: Customer[]; total: number }> {
    const qb = this.customerRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.addresses', 'addr', 'addr.isDeleted = false')
      .leftJoinAndSelect('c.phoneNumbers', 'phone', 'phone.isDeleted = false')
      .where('c.isDeleted = false');

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

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['addresses', 'phoneNumbers'],
    });
    if (!customer) throw new NotFoundException('العميل غير موجود');
    return customer;
  }

  async update(id: number, dto: Partial<CreateCustomerDto>, userId: number): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, { ...dto, lastUpdatedBy: userId });
    return this.customerRepo.save(customer);
  }

  async softDelete(id: number): Promise<void> {
    const customer = await this.findOne(id);
    customer.isDeleted = true;
    await this.customerRepo.save(customer);
  }

  async search(query: string): Promise<Customer[]> {
    return this.customerRepo.createQueryBuilder('c')
      .where('c.isDeleted = false')
      .andWhere(
        '(c.name ILIKE :q OR c.idNumber ILIKE :q OR c.primaryPhoneNumber ILIKE :q OR CAST(c.id AS TEXT) = :exact)',
        { q: `%${query}%`, exact: query },
      )
      .take(20)
      .getMany();
  }

  async getStats(): Promise<{ total: number }> {
    const total = await this.customerRepo.count({ where: { isDeleted: false } });
    return { total };
  }
}
