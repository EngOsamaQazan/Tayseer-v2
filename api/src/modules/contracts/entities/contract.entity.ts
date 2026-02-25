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
import { Customer } from '../../customers/entities/customer.entity';
import { Company } from '../../companies/entities/company.entity';

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

@Entity('contracts')
@Index(['tenantId', 'contractNumber'], { unique: true })
export class Contract {
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
  contractNumber: string;

  @Column()
  @Index()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  @Index()
  companyId: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'date' })
  contractDate: Date;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.ACTIVE })
  @Index()
  status: ContractStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  profitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  feesAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingAmount: number;

  @Column({ type: 'int', nullable: true })
  installmentsCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  installmentAmount: number;

  @Column({ type: 'date', nullable: true })
  nextDueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
