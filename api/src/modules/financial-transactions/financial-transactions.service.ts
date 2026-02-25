import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFinancialTransactionDto } from './dto/create-financial-transaction.dto';
import {
  FinancialTransaction,
  FinancialTransactionDirection,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from './entities/financial-transaction.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Company } from '../companies/entities/company.entity';

interface FinancialStatsRaw {
  totalTransactions: string;
  totalIn: string;
  totalOut: string;
}

@Injectable()
export class FinancialTransactionsService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly transactionRepo: Repository<FinancialTransaction>,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(
    dto: CreateFinancialTransactionDto,
    tenantId: string,
    userId: number,
  ): Promise<FinancialTransaction> {
    const links = await this.resolveLinkedEntities(
      {
        contractId: dto.contractId,
        customerId: dto.customerId,
        companyId: dto.companyId,
      },
      tenantId,
    );

    const transactionNumber =
      dto.transactionNumber ?? (await this.generateTransactionNumber(tenantId));
    await this.ensureTransactionNumberUnique(transactionNumber, tenantId);

    const type = dto.type;
    const direction = dto.direction ?? this.resolveDirection(type);

    const transaction = this.transactionRepo.create({
      transactionNumber,
      transactionDate: new Date(dto.transactionDate),
      type,
      direction,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber,
      accountName: dto.accountName,
      description: dto.description,
      sourceModule: dto.sourceModule ?? 'manual',
      sourceReferenceId: dto.sourceReferenceId,
      contractId: links.contractId,
      customerId: links.customerId,
      companyId: links.companyId,
      status: dto.status ?? FinancialTransactionStatus.POSTED,
      tenantId,
      createdBy: userId,
      lastUpdatedBy: userId,
    });

    return this.transactionRepo.save(transaction);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    type?: FinancialTransactionType,
    direction?: FinancialTransactionDirection,
    fromDate?: string,
    toDate?: string,
    contractId?: number,
    customerId?: number,
    companyId?: number,
  ): Promise<{ data: FinancialTransaction[]; total: number }> {
    const qb = this.transactionRepo
      .createQueryBuilder('ft')
      .leftJoinAndSelect('ft.contract', 'contract')
      .leftJoinAndSelect('ft.customer', 'customer')
      .leftJoinAndSelect('ft.company', 'company')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(ft.transactionNumber ILIKE :search OR ft.referenceNumber ILIKE :search OR ft.description ILIKE :search OR customer.name ILIKE :search OR company.name ILIKE :search OR contract.contractNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      qb.andWhere('ft.type = :type', { type });
    }
    if (direction) {
      qb.andWhere('ft.direction = :direction', { direction });
    }
    if (fromDate) {
      qb.andWhere('ft.transactionDate >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('ft.transactionDate <= :toDate', { toDate });
    }
    if (contractId) {
      qb.andWhere('ft.contractId = :contractId', { contractId });
    }
    if (customerId) {
      qb.andWhere('ft.customerId = :customerId', { customerId });
    }
    if (companyId) {
      qb.andWhere('ft.companyId = :companyId', { companyId });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('ft.transactionDate', 'DESC')
      .addOrderBy('ft.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<FinancialTransaction> {
    const transaction = await this.transactionRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['contract', 'customer', 'company'],
    });
    if (!transaction) {
      throw new NotFoundException('الحركة المالية غير موجودة');
    }
    return transaction;
  }

  async update(
    id: number,
    dto: Partial<CreateFinancialTransactionDto>,
    tenantId: string,
    userId: number,
  ): Promise<FinancialTransaction> {
    const transaction = await this.findOne(id, tenantId);
    if (transaction.sourceModule === 'income') {
      throw new BadRequestException(
        'هذه الحركة مرتبطة بدفعة، يرجى تعديل الدفعة من موديول Income',
      );
    }

    const nextTransactionNumber =
      dto.transactionNumber ?? transaction.transactionNumber;
    if (nextTransactionNumber !== transaction.transactionNumber) {
      await this.ensureTransactionNumberUnique(nextTransactionNumber, tenantId, id);
    }

    const links = await this.resolveLinkedEntities(
      {
        contractId:
          dto.contractId !== undefined ? dto.contractId : transaction.contractId,
        customerId:
          dto.customerId !== undefined ? dto.customerId : transaction.customerId,
        companyId:
          dto.companyId !== undefined ? dto.companyId : transaction.companyId,
      },
      tenantId,
    );

    const type = dto.type ?? transaction.type;
    const direction = dto.direction ?? this.resolveDirection(type);

    Object.assign(transaction, {
      transactionNumber: nextTransactionNumber,
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : transaction.transactionDate,
      type,
      direction,
      amount: dto.amount ?? transaction.amount,
      paymentMethod:
        dto.paymentMethod !== undefined
          ? dto.paymentMethod
          : transaction.paymentMethod,
      referenceNumber:
        dto.referenceNumber !== undefined
          ? dto.referenceNumber
          : transaction.referenceNumber,
      accountName:
        dto.accountName !== undefined ? dto.accountName : transaction.accountName,
      description:
        dto.description !== undefined ? dto.description : transaction.description,
      sourceModule:
        dto.sourceModule !== undefined
          ? dto.sourceModule
          : transaction.sourceModule,
      sourceReferenceId:
        dto.sourceReferenceId !== undefined
          ? dto.sourceReferenceId
          : transaction.sourceReferenceId,
      contractId: links.contractId ?? null,
      customerId: links.customerId ?? null,
      companyId: links.companyId ?? null,
      status: dto.status ?? transaction.status,
      lastUpdatedBy: userId,
    });

    return this.transactionRepo.save(transaction);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const transaction = await this.findOne(id, tenantId);
    if (transaction.sourceModule === 'income') {
      throw new BadRequestException(
        'هذه الحركة مرتبطة بدفعة، يرجى حذف الدفعة من موديول Income',
      );
    }
    transaction.isDeleted = true;
    transaction.status = FinancialTransactionStatus.CANCELLED;
    await this.transactionRepo.save(transaction);
  }

  async search(query: string, tenantId: string): Promise<FinancialTransaction[]> {
    return this.transactionRepo
      .createQueryBuilder('ft')
      .leftJoinAndSelect('ft.contract', 'contract')
      .leftJoinAndSelect('ft.customer', 'customer')
      .leftJoinAndSelect('ft.company', 'company')
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .andWhere(
        '(ft.transactionNumber ILIKE :q OR ft.referenceNumber ILIKE :q OR ft.description ILIKE :q OR customer.name ILIKE :q OR company.name ILIKE :q OR contract.contractNumber ILIKE :q)',
        { q: `%${query}%` },
      )
      .orderBy('ft.transactionDate', 'DESC')
      .take(20)
      .getMany();
  }

  async getStats(tenantId: string): Promise<{
    totalTransactions: number;
    totalIn: number;
    totalOut: number;
    net: number;
  }> {
    const raw = await this.transactionRepo
      .createQueryBuilder('ft')
      .select('COUNT(ft.id)', 'totalTransactions')
      .addSelect(
        `COALESCE(SUM(CASE WHEN ft.direction = '${FinancialTransactionDirection.IN}' THEN ft.amount ELSE 0 END), 0)`,
        'totalIn',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN ft.direction = '${FinancialTransactionDirection.OUT}' THEN ft.amount ELSE 0 END), 0)`,
        'totalOut',
      )
      .where('ft.tenantId = :tenantId', { tenantId })
      .andWhere('ft.isDeleted = false')
      .getRawOne<FinancialStatsRaw>();

    const totalIn = Number(raw?.totalIn ?? 0);
    const totalOut = Number(raw?.totalOut ?? 0);

    return {
      totalTransactions: Number(raw?.totalTransactions ?? 0),
      totalIn,
      totalOut,
      net: totalIn - totalOut,
    };
  }

  async createSystemTransaction(
    data: Omit<CreateFinancialTransactionDto, 'transactionNumber'> & {
      tenantId: string;
      userId: number;
      sourceModule?: string;
      sourceReferenceId?: number;
    },
  ): Promise<FinancialTransaction> {
    const links = await this.resolveLinkedEntities(
      {
        contractId: data.contractId,
        customerId: data.customerId,
        companyId: data.companyId,
      },
      data.tenantId,
    );

    const transactionNumber = await this.generateTransactionNumber(data.tenantId);
    await this.ensureTransactionNumberUnique(transactionNumber, data.tenantId);

    const type = data.type;
    const direction = data.direction ?? this.resolveDirection(type);

    const transaction = this.transactionRepo.create({
      transactionNumber,
      transactionDate: new Date(data.transactionDate),
      type,
      direction,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      accountName: data.accountName,
      description: data.description,
      sourceModule: data.sourceModule ?? 'system',
      sourceReferenceId: data.sourceReferenceId,
      contractId: links.contractId,
      customerId: links.customerId,
      companyId: links.companyId,
      status: data.status ?? FinancialTransactionStatus.POSTED,
      tenantId: data.tenantId,
      createdBy: data.userId,
      lastUpdatedBy: data.userId,
    });

    return this.transactionRepo.save(transaction);
  }

  async updateBySourceReference(
    tenantId: string,
    sourceModule: string,
    sourceReferenceId: number,
    dto: Partial<CreateFinancialTransactionDto>,
    userId: number,
  ): Promise<void> {
    const transaction = await this.transactionRepo.findOne({
      where: {
        tenantId,
        sourceModule,
        sourceReferenceId,
        isDeleted: false,
      },
    });

    if (!transaction) {
      return;
    }

    const links = await this.resolveLinkedEntities(
      {
        contractId:
          dto.contractId !== undefined ? dto.contractId : transaction.contractId,
        customerId:
          dto.customerId !== undefined ? dto.customerId : transaction.customerId,
        companyId:
          dto.companyId !== undefined ? dto.companyId : transaction.companyId,
      },
      tenantId,
    );

    const type = dto.type ?? transaction.type;
    const direction = dto.direction ?? this.resolveDirection(type);
    const nextTransactionNumber =
      dto.transactionNumber ?? transaction.transactionNumber;

    if (nextTransactionNumber !== transaction.transactionNumber) {
      await this.ensureTransactionNumberUnique(
        nextTransactionNumber,
        tenantId,
        transaction.id,
      );
    }

    Object.assign(transaction, {
      transactionNumber: nextTransactionNumber,
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : transaction.transactionDate,
      type,
      direction,
      amount: dto.amount ?? transaction.amount,
      paymentMethod:
        dto.paymentMethod !== undefined
          ? dto.paymentMethod
          : transaction.paymentMethod,
      referenceNumber:
        dto.referenceNumber !== undefined
          ? dto.referenceNumber
          : transaction.referenceNumber,
      accountName:
        dto.accountName !== undefined ? dto.accountName : transaction.accountName,
      description:
        dto.description !== undefined ? dto.description : transaction.description,
      status: dto.status ?? transaction.status,
      contractId: links.contractId ?? null,
      customerId: links.customerId ?? null,
      companyId: links.companyId ?? null,
      lastUpdatedBy: userId,
    });

    await this.transactionRepo.save(transaction);
  }

  async cancelBySourceReference(
    tenantId: string,
    sourceModule: string,
    sourceReferenceId: number,
    userId: number,
  ): Promise<void> {
    const transaction = await this.transactionRepo.findOne({
      where: {
        tenantId,
        sourceModule,
        sourceReferenceId,
        isDeleted: false,
      },
    });

    if (!transaction) {
      return;
    }

    transaction.status = FinancialTransactionStatus.CANCELLED;
    transaction.isDeleted = true;
    transaction.lastUpdatedBy = userId;
    await this.transactionRepo.save(transaction);
  }

  private resolveDirection(
    type: FinancialTransactionType,
  ): FinancialTransactionDirection {
    if (type === FinancialTransactionType.INCOME) {
      return FinancialTransactionDirection.IN;
    }
    if (type === FinancialTransactionType.EXPENSE) {
      return FinancialTransactionDirection.OUT;
    }
    return FinancialTransactionDirection.NEUTRAL;
  }

  private async resolveLinkedEntities(
    links: {
      contractId?: number;
      customerId?: number;
      companyId?: number;
    },
    tenantId: string,
  ): Promise<{
    contractId?: number;
    customerId?: number;
    companyId?: number;
  }> {
    let contractId = links.contractId;
    let customerId = links.customerId;
    let companyId = links.companyId;

    if (contractId) {
      const contract = await this.contractRepo.findOne({
        where: { id: contractId, tenantId, isDeleted: false },
      });

      if (!contract) {
        throw new NotFoundException('العقد المرتبط بالحركة غير موجود');
      }

      if (customerId && customerId !== contract.customerId) {
        throw new BadRequestException(
          'العميل لا يطابق العميل المرتبط بالعقد المحدد',
        );
      }
      if (companyId && companyId !== contract.companyId) {
        throw new BadRequestException(
          'المستثمر لا يطابق المستثمر المرتبط بالعقد المحدد',
        );
      }

      contractId = contract.id;
      customerId = contract.customerId;
      companyId = contract.companyId;
    }

    if (customerId) {
      const customer = await this.customerRepo.findOne({
        where: { id: customerId, tenantId, isDeleted: false },
      });
      if (!customer) {
        throw new NotFoundException('العميل المرتبط بالحركة غير موجود');
      }
    }

    if (companyId) {
      const company = await this.companyRepo.findOne({
        where: { id: companyId, tenantId, isDeleted: false },
      });
      if (!company) {
        throw new NotFoundException('المستثمر المرتبط بالحركة غير موجود');
      }
    }

    return { contractId, customerId, companyId };
  }

  private async generateTransactionNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `FT-${year}-`;
    let sequence = (await this.transactionRepo.count({ where: { tenantId } })) + 1;
    let candidate = `${prefix}${String(sequence).padStart(6, '0')}`;

    while (
      await this.transactionRepo.exist({
        where: { tenantId, transactionNumber: candidate },
      })
    ) {
      sequence += 1;
      candidate = `${prefix}${String(sequence).padStart(6, '0')}`;
    }

    return candidate;
  }

  private async ensureTransactionNumberUnique(
    transactionNumber: string,
    tenantId: string,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.transactionRepo.findOne({
      where: { transactionNumber, tenantId },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('رقم الحركة المالية مستخدم مسبقاً');
    }
  }
}
