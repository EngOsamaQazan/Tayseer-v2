import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income, IncomeStatus, IncomeType } from './entities/income.entity';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/create-income.dto';
import {
  Contract,
  ContractInstallment,
  ContractStatus,
  InstallmentStatus,
} from '../contracts/entities/contract.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
  ) {}

  async create(
    dto: CreateIncomeDto,
    tenantId: string,
    userId: number,
  ): Promise<Income> {
    const existing = await this.incomeRepo.findOne({
      where: {
        receiptNumber: dto.receiptNumber,
        tenantId,
        isDeleted: false,
      },
    });
    if (existing) {
      throw new ConflictException('رقم الإيصال مستخدم بالفعل');
    }

    const income = this.incomeRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });

    const saved = await this.incomeRepo.save(income);

    if (
      dto.contractId &&
      dto.status !== IncomeStatus.CANCELLED &&
      dto.status !== IncomeStatus.REFUNDED
    ) {
      await this.updateContractPayment(
        dto.contractId,
        tenantId,
        Number(dto.amount),
        dto.installmentNumber,
      );
    }

    return this.findOne(saved.id, tenantId);
  }

  private async updateContractPayment(
    contractId: number,
    tenantId: string,
    amount: number,
    installmentNumber?: number,
  ): Promise<void> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, tenantId, isDeleted: false },
    });
    if (!contract) return;

    contract.paidAmount = Number(contract.paidAmount) + amount;
    contract.remainingAmount = Number(contract.totalAmount) - Number(contract.paidAmount);

    if (installmentNumber) {
      const installment = await this.installmentRepo.findOne({
        where: {
          contractId,
          tenantId,
          installmentNumber,
          isDeleted: false,
        },
      });

      if (installment) {
        installment.paidAmount = Number(installment.paidAmount) + amount;
        installment.remainingAmount =
          Number(installment.amount) - Number(installment.paidAmount);

        if (installment.remainingAmount <= 0) {
          installment.status = InstallmentStatus.PAID;
          installment.paidDate = new Date();
          contract.paidInstallments = (contract.paidInstallments || 0) + 1;
        } else {
          installment.status = InstallmentStatus.PARTIAL;
        }

        await this.installmentRepo.save(installment);
      }
    }

    if (contract.remainingAmount <= 0) {
      contract.status = ContractStatus.COMPLETED;
    }

    await this.contractRepo.save(contract);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    contractId?: number,
    type?: IncomeType,
    search?: string,
  ): Promise<{ data: Income[]; total: number }> {
    const qb = this.incomeRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.contract', 'contract')
      .leftJoinAndSelect('i.customer', 'customer')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false');

    if (contractId) {
      qb.andWhere('i.contractId = :contractId', { contractId });
    }

    if (type) {
      qb.andWhere('i.type = :type', { type });
    }

    if (search) {
      qb.andWhere(
        '(i.receiptNumber ILIKE :search OR customer.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('i.paymentDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Income> {
    const income = await this.incomeRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['contract', 'customer'],
    });
    if (!income) throw new NotFoundException('الدفعة غير موجودة');
    return income;
  }

  async update(
    id: number,
    dto: UpdateIncomeDto,
    tenantId: string,
    userId: number,
  ): Promise<Income> {
    const income = await this.findOne(id, tenantId);

    if (income.status === IncomeStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن تعديل دفعة ملغاة');
    }

    Object.assign(income, { ...dto, lastUpdatedBy: userId });
    await this.incomeRepo.save(income);
    return this.findOne(id, tenantId);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const income = await this.findOne(id, tenantId);
    income.isDeleted = true;
    await this.incomeRepo.save(income);
  }

  async getByContract(
    contractId: number,
    tenantId: string,
  ): Promise<Income[]> {
    return this.incomeRepo.find({
      where: { contractId, tenantId, isDeleted: false },
      order: { paymentDate: 'DESC' },
    });
  }

  async getStats(
    tenantId: string,
  ): Promise<{
    totalIncome: number;
    totalCount: number;
    byType: Record<string, number>;
    byMethod: Record<string, number>;
  }> {
    const totalResult = await this.incomeRepo
      .createQueryBuilder('i')
      .select('COUNT(*)', 'totalCount')
      .addSelect('COALESCE(SUM(i.amount), 0)', 'totalIncome')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false')
      .andWhere('i.status != :cancelled', {
        cancelled: IncomeStatus.CANCELLED,
      })
      .getRawOne();

    const byTypeResult = await this.incomeRepo
      .createQueryBuilder('i')
      .select('i.type', 'type')
      .addSelect('COALESCE(SUM(i.amount), 0)', 'total')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false')
      .andWhere('i.status != :cancelled', {
        cancelled: IncomeStatus.CANCELLED,
      })
      .groupBy('i.type')
      .getRawMany();

    const byMethodResult = await this.incomeRepo
      .createQueryBuilder('i')
      .select('i.paymentMethod', 'method')
      .addSelect('COALESCE(SUM(i.amount), 0)', 'total')
      .where('i.tenantId = :tenantId', { tenantId })
      .andWhere('i.isDeleted = false')
      .andWhere('i.status != :cancelled', {
        cancelled: IncomeStatus.CANCELLED,
      })
      .groupBy('i.paymentMethod')
      .getRawMany();

    const byType: Record<string, number> = {};
    for (const row of byTypeResult) {
      byType[row.type as string] = parseFloat(row.total as string);
    }

    const byMethod: Record<string, number> = {};
    for (const row of byMethodResult) {
      byMethod[row.method as string] = parseFloat(row.total as string);
    }

    return {
      totalIncome: parseFloat(totalResult.totalIncome),
      totalCount: parseInt(totalResult.totalCount, 10),
      byType,
      byMethod,
    };
  }
}
