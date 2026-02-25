import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
  TransactionStatus,
  TransactionCategory,
} from './entities/financial-transaction.entity';
import {
  CreateFinancialTransactionDto,
  UpdateFinancialTransactionDto,
} from './dto/create-financial-transaction.dto';

@Injectable()
export class FinancialTransactionsService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly txnRepo: Repository<FinancialTransaction>,
  ) {}

  async create(
    dto: CreateFinancialTransactionDto,
    tenantId: string,
    userId: number,
  ): Promise<FinancialTransaction> {
    const existing = await this.txnRepo.findOne({
      where: {
        transactionNumber: dto.transactionNumber,
        tenantId,
        isDeleted: false,
      },
    });
    if (existing) {
      throw new ConflictException('رقم الحركة المالية مستخدم بالفعل');
    }

    const txn = this.txnRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.txnRepo.save(txn);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    type?: TransactionType,
    category?: TransactionCategory,
    dateFrom?: string,
    dateTo?: string,
    search?: string,
  ): Promise<{ data: FinancialTransaction[]; total: number }> {
    const qb = this.txnRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.contract', 'contract')
      .leftJoinAndSelect('t.company', 'company')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.isDeleted = false');

    if (type) {
      qb.andWhere('t.type = :type', { type });
    }

    if (category) {
      qb.andWhere('t.category = :category', { category });
    }

    if (dateFrom) {
      qb.andWhere('t.transactionDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('t.transactionDate <= :dateTo', { dateTo });
    }

    if (search) {
      qb.andWhere(
        '(t.transactionNumber ILIKE :search OR t.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('t.transactionDate', 'DESC')
      .addOrderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<FinancialTransaction> {
    const txn = await this.txnRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['contract', 'company'],
    });
    if (!txn) throw new NotFoundException('الحركة المالية غير موجودة');
    return txn;
  }

  async update(
    id: number,
    dto: UpdateFinancialTransactionDto,
    tenantId: string,
  ): Promise<FinancialTransaction> {
    const txn = await this.findOne(id, tenantId);

    if (txn.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن تعديل حركة ملغاة');
    }

    Object.assign(txn, dto);
    await this.txnRepo.save(txn);
    return this.findOne(id, tenantId);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const txn = await this.findOne(id, tenantId);
    txn.isDeleted = true;
    await this.txnRepo.save(txn);
  }

  async getSummary(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    totalTransfers: number;
    byCategory: Record<string, { income: number; expense: number }>;
  }> {
    const qb = this.txnRepo
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.isDeleted = false')
      .andWhere('t.status != :cancelled', {
        cancelled: TransactionStatus.CANCELLED,
      });

    if (dateFrom) {
      qb.andWhere('t.transactionDate >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('t.transactionDate <= :dateTo', { dateTo });
    }

    const totals = await qb
      .select(
        "COALESCE(SUM(CASE WHEN t.type = 'income' OR t.type = 'capital_injection' THEN t.amount ELSE 0 END), 0)",
        'totalIncome',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN t.type = 'expense' OR t.type = 'investor_distribution' OR t.type = 'refund' THEN t.amount ELSE 0 END), 0)",
        'totalExpense',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN t.type = 'transfer' THEN t.amount ELSE 0 END), 0)",
        'totalTransfers',
      )
      .getRawOne();

    const byCategoryResult = await this.txnRepo
      .createQueryBuilder('t')
      .select('t.category', 'category')
      .addSelect(
        "COALESCE(SUM(CASE WHEN t.type IN ('income', 'capital_injection') THEN t.amount ELSE 0 END), 0)",
        'income',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN t.type IN ('expense', 'investor_distribution', 'refund') THEN t.amount ELSE 0 END), 0)",
        'expense',
      )
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.isDeleted = false')
      .andWhere('t.status != :cancelled', {
        cancelled: TransactionStatus.CANCELLED,
      })
      .groupBy('t.category')
      .getRawMany();

    const byCategory: Record<string, { income: number; expense: number }> = {};
    for (const row of byCategoryResult) {
      byCategory[row.category as string] = {
        income: parseFloat(row.income as string),
        expense: parseFloat(row.expense as string),
      };
    }

    const totalIncome = parseFloat(totals.totalIncome);
    const totalExpense = parseFloat(totals.totalExpense);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalTransfers: parseFloat(totals.totalTransfers),
      byCategory,
    };
  }

  async getByContract(
    contractId: number,
    tenantId: string,
  ): Promise<FinancialTransaction[]> {
    return this.txnRepo.find({
      where: { contractId, tenantId, isDeleted: false },
      order: { transactionDate: 'DESC' },
    });
  }

  async getByCompany(
    companyId: number,
    tenantId: string,
  ): Promise<FinancialTransaction[]> {
    return this.txnRepo.find({
      where: { companyId, tenantId, isDeleted: false },
      relations: ['contract'],
      order: { transactionDate: 'DESC' },
    });
  }
}
