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
import { Customer } from '../../customers/entities/customer.entity';
import { Company } from '../../companies/entities/company.entity';

export enum FinancialTransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum FinancialTransactionDirection {
  IN = 'in',
  OUT = 'out',
  NEUTRAL = 'neutral',
}

export enum FinancialTransactionStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  CANCELLED = 'cancelled',
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

  @Column({ length: 100 })
  @Index()
  transactionNumber: string;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'enum', enum: FinancialTransactionType })
  @Index()
  type: FinancialTransactionType;

  @Column({
    type: 'enum',
    enum: FinancialTransactionDirection,
    default: FinancialTransactionDirection.NEUTRAL,
  })
  @Index()
  direction: FinancialTransactionDirection;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true, length: 50 })
  paymentMethod: string;

  @Column({ nullable: true, length: 100 })
  referenceNumber: string;

  @Column({ nullable: true, length: 100 })
  accountName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 50 })
  sourceModule: string;

  @Column({ nullable: true })
  sourceReferenceId: number;

  @Column({ nullable: true })
  @Index()
  contractId: number;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ nullable: true })
  @Index()
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  @Index()
  companyId: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({
    type: 'enum',
    enum: FinancialTransactionStatus,
    default: FinancialTransactionStatus.POSTED,
  })
  @Index()
  status: FinancialTransactionStatus;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  lastUpdatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
