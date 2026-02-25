import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Company } from '../../companies/entities/company.entity';

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
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

  @Column({ length: 50 })
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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cashPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  salePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  downPayment: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  financedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profitRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  profitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'int' })
  numberOfInstallments: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  installmentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({ type: 'int', default: 0 })
  paidInstallments: number;

  @Column({ type: 'int', default: 0 })
  lateInstallments: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  @Index()
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

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

  @OneToMany(() => ContractItem, (item) => item.contract, { cascade: true })
  items: ContractItem[];

  @OneToMany(() => ContractInstallment, (inst) => inst.contract, {
    cascade: true,
  })
  installments: ContractInstallment[];

  @OneToMany(() => ContractGuarantor, (g) => g.contract, { cascade: true })
  guarantors: ContractGuarantor[];
}

@Entity('contract_items')
export class ContractItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (contract) => contract.items)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ length: 255 })
  itemName: string;

  @Column({ nullable: true })
  itemDescription: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  LATE = 'late',
  WAIVED = 'waived',
}

@Entity('contract_installments')
@Index(['tenantId', 'contractId', 'installmentNumber'], { unique: true })
export class ContractInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (contract) => contract.installments)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING,
  })
  @Index()
  status: InstallmentStatus;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('contract_guarantors')
export class ContractGuarantor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (contract) => contract.guarantors)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, length: 50 })
  idNumber: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  relationship: string;

  @Column({ nullable: true })
  workplace: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
