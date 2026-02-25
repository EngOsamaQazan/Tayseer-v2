import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { Customer } from '../customers/entities/customer.entity';
import { Company } from '../companies/entities/company.entity';

interface ContractStatsRaw {
  totalContracts: string;
  totalAmount: string;
  totalPaid: string;
  totalRemaining: string;
}

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(
    dto: CreateContractDto,
    tenantId: string,
    userId: number,
  ): Promise<Contract> {
    await this.ensureContractNumberUnique(dto.contractNumber, tenantId);
    await this.ensureLinksAreValid(dto.customerId, dto.companyId, tenantId);

    const totals = this.computeFinancials(dto);
    const status = this.resolveStatus(dto.status, totals.remainingAmount);

    const contract = this.contractRepo.create({
      contractNumber: dto.contractNumber,
      customerId: dto.customerId,
      companyId: dto.companyId,
      contractDate: new Date(dto.contractDate),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      installmentsCount: dto.installmentsCount,
      installmentAmount: dto.installmentAmount,
      nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
      notes: dto.notes,
      ...totals,
      status,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });

    return this.contractRepo.save(contract);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    customerId?: number,
    companyId?: number,
    status?: ContractStatus,
  ): Promise<{ data: Contract[]; total: number }> {
    const qb = this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .leftJoinAndSelect('contract.company', 'company')
      .where('contract.tenantId = :tenantId', { tenantId })
      .andWhere('contract.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(contract.contractNumber ILIKE :search OR customer.name ILIKE :search OR company.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (customerId) {
      qb.andWhere('contract.customerId = :customerId', { customerId });
    }

    if (companyId) {
      qb.andWhere('contract.companyId = :companyId', { companyId });
    }

    if (status) {
      qb.andWhere('contract.status = :status', { status });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('contract.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['customer', 'company'],
    });
    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }
    return contract;
  }

  async update(
    id: number,
    dto: Partial<CreateContractDto>,
    tenantId: string,
    userId: number,
  ): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);

    const nextCustomerId = dto.customerId ?? contract.customerId;
    const nextCompanyId = dto.companyId ?? contract.companyId;
    await this.ensureLinksAreValid(nextCustomerId, nextCompanyId, tenantId);

    if (dto.contractNumber && dto.contractNumber !== contract.contractNumber) {
      await this.ensureContractNumberUnique(dto.contractNumber, tenantId, id);
    }

    const totals = this.computeFinancials(dto, contract);
    const status = this.resolveStatus(
      dto.status,
      totals.remainingAmount,
      contract.status,
    );

    Object.assign(contract, {
      contractNumber: dto.contractNumber ?? contract.contractNumber,
      customerId: nextCustomerId,
      companyId: nextCompanyId,
      contractDate: dto.contractDate
        ? new Date(dto.contractDate)
        : contract.contractDate,
      startDate:
        dto.startDate !== undefined
          ? dto.startDate
            ? new Date(dto.startDate)
            : null
          : contract.startDate,
      endDate:
        dto.endDate !== undefined
          ? dto.endDate
            ? new Date(dto.endDate)
            : null
          : contract.endDate,
      installmentsCount:
        dto.installmentsCount !== undefined
          ? dto.installmentsCount
          : contract.installmentsCount,
      installmentAmount:
        dto.installmentAmount !== undefined
          ? dto.installmentAmount
          : contract.installmentAmount,
      nextDueDate:
        dto.nextDueDate !== undefined
          ? dto.nextDueDate
            ? new Date(dto.nextDueDate)
            : null
          : contract.nextDueDate,
      notes: dto.notes !== undefined ? dto.notes : contract.notes,
      ...totals,
      status,
      lastUpdatedBy: userId,
    });

    return this.contractRepo.save(contract);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    contract.isDeleted = true;
    contract.status = ContractStatus.CANCELLED;
    await this.contractRepo.save(contract);
  }

  async search(query: string, tenantId: string): Promise<Contract[]> {
    return this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .leftJoinAndSelect('contract.company', 'company')
      .where('contract.tenantId = :tenantId', { tenantId })
      .andWhere('contract.isDeleted = false')
      .andWhere(
        '(contract.contractNumber ILIKE :q OR customer.name ILIKE :q OR company.name ILIKE :q)',
        { q: `%${query}%` },
      )
      .orderBy('contract.createdAt', 'DESC')
      .take(20)
      .getMany();
  }

  async getStats(tenantId: string): Promise<{
    totalContracts: number;
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
  }> {
    const raw = await this.contractRepo
      .createQueryBuilder('contract')
      .select('COUNT(contract.id)', 'totalContracts')
      .addSelect('COALESCE(SUM(contract.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(contract.paidAmount), 0)', 'totalPaid')
      .addSelect('COALESCE(SUM(contract.remainingAmount), 0)', 'totalRemaining')
      .where('contract.tenantId = :tenantId', { tenantId })
      .andWhere('contract.isDeleted = false')
      .getRawOne<ContractStatsRaw>();

    return {
      totalContracts: Number(raw?.totalContracts ?? 0),
      totalAmount: Number(raw?.totalAmount ?? 0),
      totalPaid: Number(raw?.totalPaid ?? 0),
      totalRemaining: Number(raw?.totalRemaining ?? 0),
    };
  }

  private async ensureLinksAreValid(
    customerId: number,
    companyId: number,
    tenantId: string,
  ): Promise<void> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId, tenantId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException('العميل المرتبط بالعقد غير موجود');
    }

    const company = await this.companyRepo.findOne({
      where: { id: companyId, tenantId, isDeleted: false },
    });
    if (!company) {
      throw new NotFoundException('المستثمر المرتبط بالعقد غير موجود');
    }
  }

  private async ensureContractNumberUnique(
    contractNumber: string,
    tenantId: string,
    ignoreId?: number,
  ): Promise<void> {
    const where: {
      contractNumber: string;
      tenantId: string;
      isDeleted: boolean;
      id?: number;
    } = {
      contractNumber,
      tenantId,
      isDeleted: false,
    };

    const existing = await this.contractRepo.findOne({ where });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('رقم العقد مستخدم مسبقاً');
    }
  }

  private computeFinancials(
    dto: Partial<CreateContractDto>,
    current?: Contract,
  ): {
    principalAmount: number;
    profitAmount: number;
    feesAmount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  } {
    const principalAmount =
      dto.principalAmount ?? this.toNumber(current?.principalAmount);
    const profitAmount = dto.profitAmount ?? this.toNumber(current?.profitAmount);
    const feesAmount = dto.feesAmount ?? this.toNumber(current?.feesAmount);
    const totalAmount =
      dto.totalAmount ?? principalAmount + profitAmount + feesAmount;
    const paidAmount = dto.paidAmount ?? this.toNumber(current?.paidAmount);

    if (paidAmount > totalAmount) {
      throw new BadRequestException(
        'المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي قيمة العقد',
      );
    }

    return {
      principalAmount,
      profitAmount,
      feesAmount,
      totalAmount,
      paidAmount,
      remainingAmount: Math.max(totalAmount - paidAmount, 0),
    };
  }

  private resolveStatus(
    requestedStatus: ContractStatus | undefined,
    remainingAmount: number,
    fallbackStatus?: ContractStatus,
  ): ContractStatus {
    if (requestedStatus) {
      return requestedStatus;
    }

    if (fallbackStatus === ContractStatus.CANCELLED) {
      return ContractStatus.CANCELLED;
    }
    if (fallbackStatus === ContractStatus.DEFAULTED) {
      return ContractStatus.DEFAULTED;
    }

    return remainingAmount === 0 ? ContractStatus.CLOSED : ContractStatus.ACTIVE;
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : Number(value);
  }
}
