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

export enum IncomeStatus {
  POSTED = 'posted',
  REVERSED = 'reversed',
}

@Entity('income')
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  @Index()
  contractId: number;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

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
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true, length: 50 })
  paymentMethod: string;

  @Column({ nullable: true, length: 100 })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: IncomeStatus, default: IncomeStatus.POSTED })
  @Index()
  status: IncomeStatus;

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
