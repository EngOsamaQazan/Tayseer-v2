import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  SUSPENDED = 'suspended',
}

export enum CaseType {
  EXECUTION = 'execution',
  RIGHTS = 'rights',
  CRIMINAL = 'criminal',
}

@Entity('judiciary_cases')
@Index(['tenantId', 'caseNumber'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'customerId'])
export class JudiciaryCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 50 })
  caseNumber: string;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  contractId: number;

  @Column({ type: 'enum', enum: CaseType })
  caseType: CaseType;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN })
  status: CaseStatus;

  @Column({ nullable: true, length: 100 })
  court: string;

  @Column({ nullable: true, length: 100 })
  lawyer: string;

  @Column({ type: 'date' })
  filingDate: string;

  @Column({ type: 'date', nullable: true })
  nextSessionDate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  claimAmount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
