import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudiciaryCase, JudiciaryAction } from './entities/judiciary.entity';
import {
  CreateJudiciaryCaseDto, CreateJudiciaryActionDto,
  UpdateCaseStatusDto, QueryJudiciaryDto,
} from './dto/create-judiciary.dto';

@Injectable()
export class JudiciaryService {
  constructor(
    @InjectRepository(JudiciaryCase)
    private readonly caseRepo: Repository<JudiciaryCase>,
    @InjectRepository(JudiciaryAction)
    private readonly actionRepo: Repository<JudiciaryAction>,
  ) {}

  async createCase(dto: CreateJudiciaryCaseDto, tenantId: string, userId: number): Promise<JudiciaryCase> {
    const judCase = this.caseRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });
    return this.caseRepo.save(judCase);
  }

  async findAllCases(
    tenantId: string,
    query: QueryJudiciaryDto,
    page = 1,
    limit = 20,
  ): Promise<{ data: JudiciaryCase[]; total: number }> {
    const qb = this.caseRepo.createQueryBuilder('jc')
      .leftJoinAndSelect('jc.court', 'court')
      .leftJoinAndSelect('jc.lawyer', 'lawyer')
      .where('jc.tenantId = :tenantId', { tenantId })
      .andWhere('jc.isDeleted = false');

    if (query.contractId) qb.andWhere('jc.contractId = :contractId', { contractId: query.contractId });
    if (query.caseStatus) qb.andWhere('jc.caseStatus = :caseStatus', { caseStatus: query.caseStatus });
    if (query.courtId) qb.andWhere('jc.courtId = :courtId', { courtId: query.courtId });
    if (query.lawyerId) qb.andWhere('jc.lawyerId = :lawyerId', { lawyerId: query.lawyerId });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('jc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOneCase(id: number, tenantId: string): Promise<JudiciaryCase> {
    const judCase = await this.caseRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['court', 'lawyer', 'actions'],
    });
    if (!judCase) throw new NotFoundException('القضية غير موجودة');
    return judCase;
  }

  async updateCase(id: number, dto: Partial<CreateJudiciaryCaseDto>, tenantId: string, userId: number): Promise<JudiciaryCase> {
    const judCase = await this.findOneCase(id, tenantId);
    Object.assign(judCase, { ...dto, lastUpdatedBy: userId });
    return this.caseRepo.save(judCase);
  }

  async updateCaseStatus(id: number, dto: UpdateCaseStatusDto, tenantId: string, userId: number): Promise<JudiciaryCase> {
    const judCase = await this.findOneCase(id, tenantId);
    judCase.caseStatus = dto.caseStatus;
    judCase.lastUpdatedBy = userId;
    return this.caseRepo.save(judCase);
  }

  async softDeleteCase(id: number, tenantId: string): Promise<void> {
    const judCase = await this.findOneCase(id, tenantId);
    judCase.isDeleted = true;
    await this.caseRepo.save(judCase);
  }

  async createAction(dto: CreateJudiciaryActionDto, tenantId: string, userId: number): Promise<JudiciaryAction> {
    await this.findOneCase(dto.judiciaryCaseId, tenantId);
    const action = this.actionRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });
    return this.actionRepo.save(action);
  }

  async findCaseActions(caseId: number, tenantId: string): Promise<JudiciaryAction[]> {
    await this.findOneCase(caseId, tenantId);
    return this.actionRepo.find({
      where: { judiciaryCaseId: caseId, tenantId, isDeleted: false },
      order: { actionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateAction(id: number, dto: Partial<CreateJudiciaryActionDto>, tenantId: string, userId: number): Promise<JudiciaryAction> {
    const action = await this.actionRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!action) throw new NotFoundException('الإجراء القضائي غير موجود');
    Object.assign(action, { ...dto, lastUpdatedBy: userId });
    return this.actionRepo.save(action);
  }

  async softDeleteAction(id: number, tenantId: string): Promise<void> {
    const action = await this.actionRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!action) throw new NotFoundException('الإجراء القضائي غير موجود');
    action.isDeleted = true;
    await this.actionRepo.save(action);
  }

  async getStats(tenantId: string): Promise<any> {
    const stats = await this.caseRepo.createQueryBuilder('jc')
      .select('jc.caseStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('jc.tenantId = :tenantId', { tenantId })
      .andWhere('jc.isDeleted = false')
      .groupBy('jc.caseStatus')
      .getRawMany();

    const total = await this.caseRepo.count({ where: { tenantId, isDeleted: false } });
    const totalActions = await this.actionRepo.count({ where: { tenantId, isDeleted: false } });

    return { total, totalActions, byStatus: stats };
  }
}
