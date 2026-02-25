import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contract, ContractParty, ContractItem, ContractInstallment,
  ContractStatus, InstallmentStatus,
} from './entities/contract.entity';
import { CreateContractDto, UpdateContractStatusDto, QueryContractsDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
  ) {}

  async create(dto: CreateContractDto, tenantId: string, userId: number): Promise<Contract> {
    const { parties, items, ...contractData } = dto;

    const contract = this.contractRepo.create({
      ...contractData,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
      parties: parties?.map((p) => ({ ...p, tenantId })),
      items: items?.map((i) => ({ ...i, tenantId })),
    });

    const saved = await this.contractRepo.save(contract);

    if (dto.monthlyInstallmentValue && dto.firstInstallmentDate) {
      await this.generateInstallments(saved, tenantId);
    }

    return this.findOne(saved.id, tenantId);
  }

  private async generateInstallments(contract: Contract, tenantId: string): Promise<void> {
    const remaining = contract.totalValue - (contract.firstInstallmentValue || 0);
    if (remaining <= 0 || !contract.monthlyInstallmentValue) return;

    const numInstallments = Math.ceil(remaining / contract.monthlyInstallmentValue);
    const installments: Partial<ContractInstallment>[] = [];

    const startDate = new Date(contract.firstInstallmentDate);

    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const isLast = i === numInstallments - 1;
      const amount = isLast
        ? remaining - contract.monthlyInstallmentValue * (numInstallments - 1)
        : contract.monthlyInstallmentValue;

      installments.push({
        tenantId,
        contractId: contract.id,
        installmentNumber: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: amount > 0 ? amount : contract.monthlyInstallmentValue,
        status: InstallmentStatus.PENDING,
      });
    }

    await this.installmentRepo.save(installments);
  }

  async findAll(
    tenantId: string,
    query: QueryContractsDto,
    page = 1,
    limit = 20,
  ): Promise<{ data: Contract[]; total: number }> {
    const qb = this.contractRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.parties', 'party', 'party.isDeleted = false')
      .leftJoinAndSelect('c.company', 'comp')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (query.status) qb.andWhere('c.status = :status', { status: query.status });
    if (query.companyId) qb.andWhere('c.companyId = :companyId', { companyId: query.companyId });
    if (query.customerId) {
      qb.andWhere('party.customerId = :customerId', { customerId: query.customerId });
    }
    if (query.search) {
      qb.andWhere('CAST(c.id AS TEXT) ILIKE :search', { search: `%${query.search}%` });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['parties', 'items', 'installments', 'company'],
    });
    if (!contract) throw new NotFoundException('العقد غير موجود');
    return contract;
  }

  async update(id: number, dto: Partial<CreateContractDto>, tenantId: string, userId: number): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);
    const { parties, items, ...updateData } = dto;
    Object.assign(contract, { ...updateData, updatedBy: userId });
    return this.contractRepo.save(contract);
  }

  async updateStatus(id: number, dto: UpdateContractStatusDto, tenantId: string, userId: number): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);
    contract.status = dto.status;
    if (dto.notes) contract.notes = dto.notes;
    contract.updatedBy = userId;
    return this.contractRepo.save(contract);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    contract.isDeleted = true;
    await this.contractRepo.save(contract);
  }

  async getInstallments(contractId: number, tenantId: string): Promise<ContractInstallment[]> {
    await this.findOne(contractId, tenantId);
    return this.installmentRepo.find({
      where: { contractId, tenantId, isDeleted: false },
      order: { installmentNumber: 'ASC' },
    });
  }

  async getStats(tenantId: string): Promise<any> {
    const stats = await this.contractRepo.createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(c.totalValue)', 'totalValue')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .groupBy('c.status')
      .getRawMany();

    const total = await this.contractRepo.count({ where: { tenantId, isDeleted: false } });

    return { total, byStatus: stats };
  }
}
