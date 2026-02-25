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

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  MOBILE_WALLET = 'mobile_wallet',
  OTHER = 'other',
}

export enum IncomeStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum IncomeType {
  INSTALLMENT = 'installment',
  DOWN_PAYMENT = 'down_payment',
  LATE_FEE = 'late_fee',
  EARLY_SETTLEMENT = 'early_settlement',
  OTHER = 'other',
}

@Entity('income')
@Index(['tenantId', 'receiptNumber'], { unique: true })
export class Income {
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
  receiptNumber: string;

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

  @Column({
    type: 'enum',
    enum: IncomeType,
    default: IncomeType.INSTALLMENT,
  })
  @Index()
  type: IncomeType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  installmentNumber: number;

  @Column({ nullable: true })
  checkNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({
    type: 'enum',
    enum: IncomeStatus,
    default: IncomeStatus.CONFIRMED,
  })
  @Index()
  status: IncomeStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  collectedBy: number;

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
