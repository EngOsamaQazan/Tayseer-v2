import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  TransactionStatus,
} from '../financial-transactions/entities/financial-transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import {
  FinancialReportQueryDto,
  CustomerReportQueryDto,
} from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly txRepo: Repository<FinancialTransaction>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async getFinancialReport(tenantId: string, query: FinancialReportQueryDto) {
    const qb = this.txRepo
      .createQueryBuilder('ft')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .andWhere('ft.status = :status', {
        status: TransactionStatus.CONFIRMED,
      });

    if (query.startDate) {
      qb.andWhere('ft.date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('ft.date <= :endDate', { endDate: query.endDate });
    }
    if (query.type) {
      qb.andWhere('ft.type = :type', { type: query.type });
    }

    const groupBy = query.groupBy || 'month';
    let groupExpr: string;
    let selectExpr: string;

    switch (groupBy) {
      case 'day':
        groupExpr = "TO_CHAR(ft.date, 'YYYY-MM-DD')";
        selectExpr = groupExpr;
        break;
      case 'year':
        groupExpr = "TO_CHAR(ft.date, 'YYYY')";
        selectExpr = groupExpr;
        break;
      case 'category':
        qb.leftJoin('ft.category', 'cat');
        groupExpr = 'cat.name';
        selectExpr = "COALESCE(cat.name, 'بدون تصنيف')";
        break;
      default:
        groupExpr = "TO_CHAR(ft.date, 'YYYY-MM')";
        selectExpr = groupExpr;
    }

    const result = await qb
      .select(selectExpr, 'period')
      .addSelect('ft.type', 'type')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .addSelect('COALESCE(AVG(ft.amount), 0)', 'average')
      .addSelect('COALESCE(MIN(ft.amount), 0)', 'min')
      .addSelect('COALESCE(MAX(ft.amount), 0)', 'max')
      .groupBy(groupBy === 'category' ? 'cat.name' : groupExpr)
      .addGroupBy('ft.type')
      .orderBy(groupBy === 'category' ? 'total' : 'period', groupBy === 'category' ? 'DESC' : 'ASC')
      .getRawMany();

    const totals = await this.txRepo
      .createQueryBuilder('ft')
      .select('ft.type', 'type')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .andWhere('ft.status = :status', {
        status: TransactionStatus.CONFIRMED,
      })
      .andWhere(query.startDate ? 'ft.date >= :startDate' : '1=1', {
        startDate: query.startDate,
      })
      .andWhere(query.endDate ? 'ft.date <= :endDate' : '1=1', {
        endDate: query.endDate,
      })
      .groupBy('ft.type')
      .getRawMany();

    return {
      groupBy,
      data: result,
      totals,
    };
  }

  async getIncomeVsExpenseReport(tenantId: string, query: FinancialReportQueryDto) {
    const qb = this.txRepo
      .createQueryBuilder('ft')
      .select("TO_CHAR(ft.date, 'YYYY-MM')", 'month')
      .addSelect(
        "COALESCE(SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END), 0)",
        'income',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END), 0)",
        'expense',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END), 0)",
        'net',
      )
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .andWhere('ft.status = :status', {
        status: TransactionStatus.CONFIRMED,
      });

    if (query.startDate) {
      qb.andWhere('ft.date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('ft.date <= :endDate', { endDate: query.endDate });
    }

    const result = await qb
      .groupBy("TO_CHAR(ft.date, 'YYYY-MM')")
      .orderBy("TO_CHAR(ft.date, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return result;
  }

  async getCustomerReport(tenantId: string, query: CustomerReportQueryDto) {
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (query.startDate) {
      qb.andWhere('c.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      qb.andWhere('c.createdAt <= :endDate', { endDate: query.endDate });
    }
    if (query.city) {
      qb.andWhere('c.city = :city', { city: query.city });
    }

    const total = await qb.getCount();

    const byCity = await this.customerRepo
      .createQueryBuilder('c')
      .select('c.city', 'city')
      .addSelect('COUNT(*)::int', 'count')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .groupBy('c.city')
      .orderBy('count', 'DESC')
      .getRawMany();

    const monthlyRegistrations = await this.customerRepo
      .createQueryBuilder('c')
      .select("TO_CHAR(c.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)::int', 'count')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false')
      .andWhere("c.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(c.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(c.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return {
      total,
      byCity,
      monthlyRegistrations,
    };
  }

  async getAuditReport(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .select('a.action', 'action')
      .addSelect('a.entityType', 'entityType')
      .addSelect('COUNT(*)::int', 'count')
      .where('a.tenantId = :tenantId', { tenantId });

    if (startDate) {
      qb.andWhere('a.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('a.createdAt <= :endDate', { endDate });
    }

    const byAction = await qb
      .groupBy('a.action')
      .addGroupBy('a.entityType')
      .orderBy('count', 'DESC')
      .getRawMany();

    const dailyActivity = await this.auditRepo
      .createQueryBuilder('a')
      .select("TO_CHAR(a.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere("a.createdAt >= NOW() - INTERVAL '30 days'")
      .groupBy("TO_CHAR(a.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(a.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return {
      byAction,
      dailyActivity,
    };
  }
}
