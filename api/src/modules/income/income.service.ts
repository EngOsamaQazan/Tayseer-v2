import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { Income, IncomeStatus } from './entities/income.entity';
import { Contract, ContractStatus } from '../contracts/entities/contract.entity';
import { FinancialTransactionsService } from '../financial-transactions/financial-transactions.service';
import {
  FinancialTransactionDirection,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../financial-transactions/entities/financial-transaction.entity';

interface IncomeStatsRaw {
  totalPayments: string;
  totalAmount: string;
  averagePayment: string;
}

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    private readonly financialTransactionsService: FinancialTransactionsService,
  ) {}

  async create(dto: CreateIncomeDto, tenantId: string, userId: number): Promise<Income> {
    if (dto.status === IncomeStatus.REVERSED) {
      throw new BadRequestException('لا يمكن إنشاء دفعة بحالة معكوسة');
    }

    const contract = await this.getContractOrThrow(dto.contractId, tenantId);
    if (contract.status === ContractStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن إضافة دفعات على عقد ملغي');
    }
    if (contract.status === ContractStatus.DEFAULTED) {
      throw new BadRequestException('لا يمكن إضافة دفعات على عقد متعثر');
    }

    await this.ensureContractCanAcceptPayment(contract, dto.amount);

    const income = this.incomeRepo.create({
      contractId: contract.id,
      customerId: contract.customerId,
      companyId: contract.companyId,
      paymentDate: new Date(dto.paymentDate),
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber,
      notes: dto.notes,
      status: dto.status ?? IncomeStatus.POSTED,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });

    const savedIncome = await this.incomeRepo.save(income);
    await this.applyPaymentToContract(contract, dto.amount, userId);

    await this.financialTransactionsService.createSystemTransaction({
      tenantId,
      userId,
      transactionDate: dto.paymentDate,
      type: FinancialTransactionType.INCOME,
      direction: FinancialTransactionDirection.IN,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber,
      description: dto.notes ?? `دفعة على العقد ${contract.contractNumber}`,
      contractId: contract.id,
      customerId: contract.customerId,
      companyId: contract.companyId,
      status: FinancialTransactionStatus.POSTED,
      sourceModule: 'income',
      sourceReferenceId: savedIncome.id,
    });

    return this.findOne(savedIncome.id, tenantId);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    contractId?: number,
    customerId?: number,
    companyId?: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ data: Income[]; total: number }> {
    const qb = this.incomeRepo
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.contract', 'contract')
      .leftJoinAndSelect('income.customer', 'customer')
      .leftJoinAndSelect('income.company', 'company')
      .where('income.tenantId = :tenantId', { tenantId })
      .andWhere('income.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(income.referenceNumber ILIKE :search OR income.notes ILIKE :search OR contract.contractNumber ILIKE :search OR customer.name ILIKE :search OR company.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (contractId) {
      qb.andWhere('income.contractId = :contractId', { contractId });
    }
    if (customerId) {
      qb.andWhere('income.customerId = :customerId', { customerId });
    }
    if (companyId) {
      qb.andWhere('income.companyId = :companyId', { companyId });
    }
    if (fromDate) {
      qb.andWhere('income.paymentDate >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('income.paymentDate <= :toDate', { toDate });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('income.paymentDate', 'DESC')
      .addOrderBy('income.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Income> {
    const income = await this.incomeRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['contract', 'customer', 'company'],
    });

    if (!income) {
      throw new NotFoundException('الدفعة غير موجودة');
    }
    return income;
  }

  async update(
    id: number,
    dto: Partial<CreateIncomeDto>,
    tenantId: string,
    userId: number,
  ): Promise<Income> {
    const income = await this.findOne(id, tenantId);
    if (income.status === IncomeStatus.REVERSED) {
      throw new BadRequestException('لا يمكن تعديل دفعة معكوسة');
    }
    if (dto.status === IncomeStatus.REVERSED) {
      throw new BadRequestException(
        'لا يمكن تحويل الدفعة إلى معكوسة من التعديل، استخدم الحذف',
      );
    }

    const oldAmount = this.toNumber(income.amount);
    const nextAmount = dto.amount ?? oldAmount;
    if (nextAmount <= 0) {
      throw new BadRequestException('قيمة الدفعة يجب أن تكون أكبر من صفر');
    }

    const oldContract = await this.getContractOrThrow(income.contractId, tenantId);
    const nextContract = await this.getContractOrThrow(
      dto.contractId ?? income.contractId,
      tenantId,
    );

    if (
      nextContract.status === ContractStatus.CANCELLED ||
      nextContract.status === ContractStatus.DEFAULTED
    ) {
      throw new BadRequestException('لا يمكن إضافة دفعة على عقد غير نشط');
    }

    if (oldContract.id === nextContract.id) {
      const projectedPaid =
        this.toNumber(oldContract.paidAmount) - oldAmount + nextAmount;
      if (projectedPaid > this.toNumber(oldContract.totalAmount)) {
        throw new BadRequestException('الدفعة تتجاوز الرصيد المتبقي في العقد');
      }
      await this.applyPaymentToContract(oldContract, nextAmount - oldAmount, userId);
    } else {
      await this.ensureContractCanAcceptPayment(nextContract, nextAmount);
      await this.applyPaymentToContract(oldContract, -oldAmount, userId);
      await this.applyPaymentToContract(nextContract, nextAmount, userId);
    }

    Object.assign(income, {
      contractId: nextContract.id,
      customerId: nextContract.customerId,
      companyId: nextContract.companyId,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : income.paymentDate,
      amount: nextAmount,
      paymentMethod:
        dto.paymentMethod !== undefined ? dto.paymentMethod : income.paymentMethod,
      referenceNumber:
        dto.referenceNumber !== undefined
          ? dto.referenceNumber
          : income.referenceNumber,
      notes: dto.notes !== undefined ? dto.notes : income.notes,
      lastUpdatedBy: userId,
    });

    const updated = await this.incomeRepo.save(income);

    await this.financialTransactionsService.updateBySourceReference(
      tenantId,
      'income',
      updated.id,
      {
        transactionDate: this.toDateString(updated.paymentDate),
        type: FinancialTransactionType.INCOME,
        direction: FinancialTransactionDirection.IN,
        amount: this.toNumber(updated.amount),
        paymentMethod: updated.paymentMethod,
        referenceNumber: updated.referenceNumber,
        description:
          updated.notes ?? `دفعة على العقد ${nextContract.contractNumber}`,
        contractId: updated.contractId,
        customerId: updated.customerId,
        companyId: updated.companyId,
        status: FinancialTransactionStatus.POSTED,
      },
      userId,
    );

    return this.findOne(updated.id, tenantId);
  }

  async softDelete(id: number, tenantId: string, userId: number): Promise<void> {
    const income = await this.findOne(id, tenantId);
    if (income.status === IncomeStatus.REVERSED || income.isDeleted) {
      return;
    }

    const contract = await this.getContractOrThrow(income.contractId, tenantId);
    await this.applyPaymentToContract(contract, -this.toNumber(income.amount), userId);

    income.status = IncomeStatus.REVERSED;
    income.isDeleted = true;
    income.lastUpdatedBy = userId;
    await this.incomeRepo.save(income);

    await this.financialTransactionsService.cancelBySourceReference(
      tenantId,
      'income',
      income.id,
      userId,
    );
  }

  async search(query: string, tenantId: string): Promise<Income[]> {
    return this.incomeRepo
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.contract', 'contract')
      .leftJoinAndSelect('income.customer', 'customer')
      .leftJoinAndSelect('income.company', 'company')
      .where('income.tenantId = :tenantId', { tenantId })
      .andWhere('income.isDeleted = false')
      .andWhere(
        '(income.referenceNumber ILIKE :q OR income.notes ILIKE :q OR contract.contractNumber ILIKE :q OR customer.name ILIKE :q OR company.name ILIKE :q)',
        { q: `%${query}%` },
      )
      .orderBy('income.paymentDate', 'DESC')
      .take(20)
      .getMany();
  }

  async getStats(tenantId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    averagePayment: number;
  }> {
    const raw = await this.incomeRepo
      .createQueryBuilder('income')
      .select('COUNT(income.id)', 'totalPayments')
      .addSelect('COALESCE(SUM(income.amount), 0)', 'totalAmount')
      .addSelect('COALESCE(AVG(income.amount), 0)', 'averagePayment')
      .where('income.tenantId = :tenantId', { tenantId })
      .andWhere('income.isDeleted = false')
      .getRawOne<IncomeStatsRaw>();

    return {
      totalPayments: Number(raw?.totalPayments ?? 0),
      totalAmount: Number(raw?.totalAmount ?? 0),
      averagePayment: Number(raw?.averagePayment ?? 0),
    };
  }

  private async getContractOrThrow(
    contractId: number,
    tenantId: string,
  ): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, tenantId, isDeleted: false },
    });

    if (!contract) {
      throw new NotFoundException('العقد المرتبط بالدفعة غير موجود');
    }

    return contract;
  }

  private async ensureContractCanAcceptPayment(
    contract: Contract,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('قيمة الدفعة يجب أن تكون أكبر من صفر');
    }

    const projectedPaid = this.toNumber(contract.paidAmount) + amount;
    if (projectedPaid > this.toNumber(contract.totalAmount)) {
      throw new BadRequestException('الدفعة تتجاوز الرصيد المتبقي في العقد');
    }
  }

  private async applyPaymentToContract(
    contract: Contract,
    deltaAmount: number,
    userId: number,
  ): Promise<void> {
    const totalAmount = this.toNumber(contract.totalAmount);
    const nextPaidAmount = this.toNumber(contract.paidAmount) + deltaAmount;

    if (nextPaidAmount < 0) {
      throw new BadRequestException('رصيد المدفوع على العقد لا يمكن أن يكون سالباً');
    }
    if (nextPaidAmount > totalAmount) {
      throw new BadRequestException('المبلغ المدفوع تجاوز إجمالي قيمة العقد');
    }

    contract.paidAmount = nextPaidAmount;
    contract.remainingAmount = Math.max(totalAmount - nextPaidAmount, 0);
    contract.lastUpdatedBy = userId;

    if (
      contract.status !== ContractStatus.CANCELLED &&
      contract.status !== ContractStatus.DEFAULTED
    ) {
      contract.status =
        contract.remainingAmount === 0
          ? ContractStatus.CLOSED
          : ContractStatus.ACTIVE;
    }

    await this.contractRepo.save(contract);
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : Number(value);
  }

  private toDateString(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
