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

  async create(dto: CreateCompanyDto, userId: number): Promise<Company> {
    const company = this.companyRepo.create({ ...dto, createdBy: userId });
    return this.companyRepo.save(company);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Company[]; total: number }> {
    const [data, total] = await this.companyRepo.findAndCount({
      where: { isDeleted: false },
      relations: ['bankAccounts'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['bankAccounts'],
    });
    if (!company) throw new NotFoundException('المستثمر غير موجود');
    return company;
  }

  async update(id: number, dto: Partial<CreateCompanyDto>): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async softDelete(id: number): Promise<void> {
    const company = await this.findOne(id);
    company.isDeleted = true;
    await this.companyRepo.save(company);
    await this.bankRepo.update({ companyId: id }, { isDeleted: true });
  }

  async getPrimaryCompany(): Promise<Company | null> {
    return this.companyRepo.findOne({
      where: { isPrimaryCompany: true, isDeleted: false },
      relations: ['bankAccounts'],
    });
  }
}
