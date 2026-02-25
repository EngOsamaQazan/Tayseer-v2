import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lawyer } from './entities/lawyer.entity';
import { CreateLawyerDto } from './dto/create-lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(
    @InjectRepository(Lawyer)
    private readonly lawyerRepo: Repository<Lawyer>,
  ) {}

  async create(dto: CreateLawyerDto, tenantId: string, userId: number): Promise<Lawyer> {
    const lawyer = this.lawyerRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });
    return this.lawyerRepo.save(lawyer);
  }

  async findAll(tenantId: string, activeOnly = false): Promise<Lawyer[]> {
    const where: any = { tenantId, isDeleted: false };
    if (activeOnly) where.isActive = true;
    return this.lawyerRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Lawyer> {
    const lawyer = await this.lawyerRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!lawyer) throw new NotFoundException('المحامي غير موجود');
    return lawyer;
  }

  async update(id: number, dto: Partial<CreateLawyerDto>, tenantId: string, userId: number): Promise<Lawyer> {
    const lawyer = await this.findOne(id, tenantId);
    Object.assign(lawyer, { ...dto, lastUpdatedBy: userId });
    return this.lawyerRepo.save(lawyer);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const lawyer = await this.findOne(id, tenantId);
    lawyer.isDeleted = true;
    await this.lawyerRepo.save(lawyer);
  }
}
