import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyBank } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CompanyBank)
    private readonly bankRepo: Repository<CompanyBank>,
  ) {}

  async create(dto: CreateCompanyDto, tenantId: string, userId: number): Promise<Company> {
    const { bankAccounts, ...companyData } = dto;
    const company = this.companyRepo.create({
      ...companyData,
      tenantId,
      createdBy: userId,
      bankAccounts: bankAccounts?.map((b) => ({ ...b, tenantId })),
    });
    return this.companyRepo.save(company);
  }

  async findAll(tenantId: string, page = 1, limit = 20): Promise<{ data: Company[]; total: number }> {
    const [data, total] = await this.companyRepo.findAndCount({
      where: { tenantId, isDeleted: false },
      relations: ['bankAccounts'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['bankAccounts'],
    });
    if (!company) throw new NotFoundException('المستثمر غير موجود');
    return company;
  }

  async update(id: number, dto: Partial<CreateCompanyDto>, tenantId: string): Promise<Company> {
    const company = await this.findOne(id, tenantId);
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const company = await this.findOne(id, tenantId);
    company.isDeleted = true;
    await this.companyRepo.save(company);
  }
}
