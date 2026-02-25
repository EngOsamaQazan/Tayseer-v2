import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contract,
  ContractItem,
  ContractInstallment,
  ContractGuarantor,
  ContractStatus,
  InstallmentStatus,
} from './entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
  ) {}

  async create(
    dto: CreateContractDto,
    tenantId: string,
    userId: number,
  ): Promise<Contract> {
    const existing = await this.contractRepo.findOne({
      where: {
        contractNumber: dto.contractNumber,
        tenantId,
        isDeleted: false,
      },
    });
    if (existing) {
      throw new ConflictException('رقم العقد مستخدم بالفعل');
    }

    const { items, guarantors, ...contractData } = dto;

    const contract = this.contractRepo.create({
      ...contractData,
      tenantId,
      remainingAmount: dto.totalAmount - (dto.downPayment || 0),
      createdBy: userId,
      lastUpdatedBy: userId,
      items: items?.map((i) => ({ ...i, tenantId })),
      guarantors: guarantors?.map((g) => ({ ...g, tenantId })),
    });

    const saved = await this.contractRepo.save(contract);

    if (dto.numberOfInstallments > 0 && dto.startDate) {
      await this.generateInstallments(saved, tenantId);
    }

    return this.findOne(saved.id, tenantId);
  }

  private async generateInstallments(
    contract: Contract,
    tenantId: string,
  ): Promise<void> {
    const installments: Partial<ContractInstallment>[] = [];
    const startDate = new Date(contract.startDate);
    const amountPerInstallment = Number(contract.installmentAmount);

    for (let i = 1; i <= contract.numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      installments.push({
        tenantId,
        contractId: contract.id,
        installmentNumber: i,
        dueDate,
        amount: amountPerInstallment,
        paidAmount: 0,
        remainingAmount: amountPerInstallment,
        status: InstallmentStatus.PENDING,
      });
    }

    await this.installmentRepo.save(installments);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    status?: ContractStatus,
    search?: string,
  ): Promise<{ data: Contract[]; total: number }> {
    const qb = this.contractRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.company', 'company')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(c.contractNumber ILIKE :search OR customer.name ILIKE :search)',
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

  async findOne(id: number, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: [
        'customer',
        'company',
        'items',
        'installments',
        'guarantors',
      ],
    });
    if (!contract) throw new NotFoundException('العقد غير موجود');
    return contract;
  }

  async update(
    id: number,
    dto: UpdateContractDto,
    tenantId: string,
    userId: number,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (
      contract.status === ContractStatus.COMPLETED ||
      contract.status === ContractStatus.CANCELLED
    ) {
      throw new BadRequestException('لا يمكن تعديل عقد مكتمل أو ملغي');
    }

    Object.assign(contract, { ...dto, lastUpdatedBy: userId });
    await this.contractRepo.save(contract);
    return this.findOne(id, tenantId);
  }

  async activate(
    id: number,
    tenantId: string,
    userId: number,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('يمكن تفعيل العقود المسودة فقط');
    }

    if (!contract.installments || contract.installments.length === 0) {
      if (contract.startDate) {
        await this.generateInstallments(contract, tenantId);
      } else {
        throw new BadRequestException(
          'يجب تحديد تاريخ البدء قبل تفعيل العقد',
        );
      }
    }

    contract.status = ContractStatus.ACTIVE;
    contract.lastUpdatedBy = userId;
    await this.contractRepo.save(contract);
    return this.findOne(id, tenantId);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    contract.isDeleted = true;
    await this.contractRepo.save(contract);
  }

  async getInstallments(
    contractId: number,
    tenantId: string,
  ): Promise<ContractInstallment[]> {
    await this.findOne(contractId, tenantId);
    return this.installmentRepo.find({
      where: { contractId, tenantId, isDeleted: false },
      order: { installmentNumber: 'ASC' },
    });
  }

  async getStats(
    tenantId: string,
  ): Promise<{
    total: number;
    active: number;
    completed: number;
    defaulted: number;
    totalValue: number;
    totalPaid: number;
    totalRemaining: number;
  }> {
    const stats = await this.contractRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'total')
      .addSelect(
        "COUNT(*) FILTER (WHERE c.status = 'active')",
        'active',
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE c.status = 'completed')",
        'completed',
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE c.status = 'defaulted')",
        'defaulted',
      )
      .addSelect('COALESCE(SUM(c.totalAmount), 0)', 'totalValue')
      .addSelect('COALESCE(SUM(c.paidAmount), 0)', 'totalPaid')
      .addSelect('COALESCE(SUM(c.remainingAmount), 0)', 'totalRemaining')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .getRawOne();

    return {
      total: parseInt(stats.total, 10),
      active: parseInt(stats.active, 10),
      completed: parseInt(stats.completed, 10),
      defaulted: parseInt(stats.defaulted, 10),
      totalValue: parseFloat(stats.totalValue),
      totalPaid: parseFloat(stats.totalPaid),
      totalRemaining: parseFloat(stats.totalRemaining),
    };
  }
}
