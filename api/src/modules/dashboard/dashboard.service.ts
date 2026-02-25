import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import {
  FinancialTransaction,
  TransactionType,
  TransactionStatus,
} from '../financial-transactions/entities/financial-transaction.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(FinancialTransaction)
    private readonly txRepo: Repository<FinancialTransaction>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async getSummary(tenantId: string) {
    const [
      totalCustomers,
      totalCompanies,
      incomeStats,
      expenseStats,
      recentTransactions,
      monthlyIncome,
      monthlyExpense,
    ] = await Promise.all([
      this.customerRepo.count({
        where: { tenantId, isDeleted: false },
      }),
      this.companyRepo.count({
        where: { tenantId, isDeleted: false },
      }),
      this.getTransactionSum(tenantId, TransactionType.INCOME),
      this.getTransactionSum(tenantId, TransactionType.EXPENSE),
      this.getRecentTransactions(tenantId),
      this.getMonthlyTotals(tenantId, TransactionType.INCOME),
      this.getMonthlyTotals(tenantId, TransactionType.EXPENSE),
    ]);

    return {
      counts: {
        customers: totalCustomers,
        companies: totalCompanies,
      },
      financials: {
        totalIncome: Number(incomeStats.total) || 0,
        incomeCount: Number(incomeStats.count) || 0,
        totalExpense: Number(expenseStats.total) || 0,
        expenseCount: Number(expenseStats.count) || 0,
        netBalance:
          (Number(incomeStats.total) || 0) -
          (Number(expenseStats.total) || 0),
      },
      recentTransactions,
      charts: {
        monthlyIncome,
        monthlyExpense,
      },
    };
  }

  async getFinancialSummary(tenantId: string) {
    const result = await this.txRepo
      .createQueryBuilder('ft')
      .select('ft.type', 'type')
      .addSelect('ft.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .groupBy('ft.type')
      .addGroupBy('ft.status')
      .getRawMany();

    return result;
  }

  async getCustomerStats(tenantId: string) {
    const totalCustomers = await this.customerRepo.count({
      where: { tenantId, isDeleted: false },
    });

    const recentCustomers = await this.customerRepo
      .createQueryBuilder('c')
      .select(['c.id', 'c.name', 'c.primaryPhoneNumber', 'c.createdAt'])
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .orderBy('c.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return {
      total: totalCustomers,
      recentCustomers,
    };
  }

  private async getTransactionSum(tenantId: string, type: TransactionType) {
    const result = await this.txRepo
      .createQueryBuilder('ft')
      .select('COALESCE(SUM(ft.amount), 0)', 'total')
      .addSelect('COUNT(*)::int', 'count')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.type = :type', { type })
      .andWhere('ft.status = :status', { status: TransactionStatus.CONFIRMED })
      .andWhere('ft.isDeleted = false')
      .getRawOne();

    return result;
  }

  private async getRecentTransactions(tenantId: string, limit = 10) {
    return this.txRepo
      .createQueryBuilder('ft')
      .leftJoinAndSelect('ft.category', 'cat')
      .leftJoinAndSelect('ft.company', 'comp')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .orderBy('ft.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  private async getMonthlyTotals(tenantId: string, type: TransactionType) {
    const result = await this.txRepo
      .createQueryBuilder('ft')
      .select("TO_CHAR(ft.date, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .addSelect('COUNT(*)::int', 'count')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.type = :type', { type })
      .andWhere('ft.status = :status', { status: TransactionStatus.CONFIRMED })
      .andWhere('ft.isDeleted = false')
      .andWhere('ft.date >= NOW() - INTERVAL \'12 months\'')
      .groupBy("TO_CHAR(ft.date, 'YYYY-MM')")
      .orderBy("TO_CHAR(ft.date, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return result;
  }
}
