import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudiciaryCase, CaseStatus } from './entities/judiciary-case.entity';
import { CreateJudiciaryCaseDto } from './dto/create-judiciary-case.dto';

@Injectable()
export class JudiciaryService {
  constructor(
    @InjectRepository(JudiciaryCase)
    private readonly caseRepo: Repository<JudiciaryCase>,
  ) {}

  async create(dto: CreateJudiciaryCaseDto, tenantId: string, userId: number) {
    const exists = await this.caseRepo.findOne({
      where: { tenantId, caseNumber: dto.caseNumber, isDeleted: false },
    });
    if (exists) throw new ConflictException('رقم القضية موجود مسبقاً');

    const c = this.caseRepo.create({ ...dto, tenantId, createdBy: userId });
    return this.caseRepo.save(c);
  }

  async findAll(tenantId: string, page = 1, limit = 20, status?: CaseStatus, search?: string) {
    const qb = this.caseRepo.createQueryBuilder('j')
      .leftJoinAndSelect('j.customer', 'cust')
      .where('j.tenantId = :tenantId', { tenantId })
      .andWhere('j.isDeleted = false');

    if (status) qb.andWhere('j.status = :status', { status });
    if (search) {
      qb.andWhere('(j.caseNumber ILIKE :s OR cust.name ILIKE :s)', { s: `%${search}%` });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('j.createdAt', 'DESC')
      .skip((page - 1) * limit).take(limit).getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: string) {
    const c = await this.caseRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['customer'],
    });
    if (!c) throw new NotFoundException('القضية غير موجودة');
    return c;
  }

  async update(id: number, dto: Partial<CreateJudiciaryCaseDto>, tenantId: string) {
    const c = await this.findOne(id, tenantId);
    Object.assign(c, dto);
    return this.caseRepo.save(c);
  }

  async remove(id: number, tenantId: string) {
    const c = await this.findOne(id, tenantId);
    c.isDeleted = true;
    return this.caseRepo.save(c);
  }
}
