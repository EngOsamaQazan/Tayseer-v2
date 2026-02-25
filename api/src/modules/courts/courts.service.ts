import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from './entities/court.entity';
import { CreateCourtDto } from './dto/create-court.dto';

@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private readonly courtRepo: Repository<Court>,
  ) {}

  async create(dto: CreateCourtDto, tenantId: string, userId: number): Promise<Court> {
    const court = this.courtRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });
    return this.courtRepo.save(court);
  }

  async findAll(tenantId: string): Promise<Court[]> {
    return this.courtRepo.find({
      where: { tenantId, isDeleted: false },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Court> {
    const court = await this.courtRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!court) throw new NotFoundException('المحكمة غير موجودة');
    return court;
  }

  async update(id: number, dto: Partial<CreateCourtDto>, tenantId: string, userId: number): Promise<Court> {
    const court = await this.findOne(id, tenantId);
    Object.assign(court, { ...dto, lastUpdatedBy: userId });
    return this.courtRepo.save(court);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const court = await this.findOne(id, tenantId);
    court.isDeleted = true;
    await this.courtRepo.save(court);
  }
}
