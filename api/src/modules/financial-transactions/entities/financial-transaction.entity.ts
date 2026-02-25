import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Company } from '../../companies/entities/company.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  INVESTOR_DISTRIBUTION = 'investor_distribution',
  CAPITAL_INJECTION = 'capital_injection',
  REFUND = 'refund',
}

export enum TransactionStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum TransactionCategory {
  INSTALLMENT_PAYMENT = 'installment_payment',
  DOWN_PAYMENT = 'down_payment',
  LATE_FEE = 'late_fee',
  SALARY = 'salary',
  RENT = 'rent',
  UTILITIES = 'utilities',
  INVESTOR_PROFIT = 'investor_profit',
  CAPITAL_RETURN = 'capital_return',
  OFFICE_EXPENSE = 'office_expense',
  LEGAL_EXPENSE = 'legal_expense',
  TRANSFER_BETWEEN_ACCOUNTS = 'transfer_between_accounts',
  OTHER = 'other',
}

@Entity('financial_transactions')
@Index(['tenantId', 'transactionNumber'], { unique: true })
export class FinancialTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 50 })
  @Index()
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  @Index()
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
    default: TransactionCategory.OTHER,
  })
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ length: 255 })
  description: string;

  @Column({ nullable: true })
  @Index()
  contractId: number;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ nullable: true })
  @Index()
  companyId: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  incomeId: number;

  @Column({ nullable: true })
  fromAccount: string;

  @Column({ nullable: true })
  toAccount: string;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.CONFIRMED,
  })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
