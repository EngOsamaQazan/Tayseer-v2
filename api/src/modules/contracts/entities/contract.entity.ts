import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

export enum ContractType {
  SOLIDARITY = 'solidarity',
  NORMAL = 'normal',
}

export enum ContractStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  LEGAL_DEPARTMENT = 'legal_department',
  JUDICIARY = 'judiciary',
  SETTLEMENT = 'settlement',
  FINISHED = 'finished',
  CANCELED = 'canceled',
  REFUSED = 'refused',
}

@Entity('contracts')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'companyId'])
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'enum', enum: ContractType })
  type: ContractType;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.ACTIVE })
  status: ContractStatus;

  @Column()
  companyId: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'date' })
  dateOfSale: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  firstInstallmentValue: number;

  @Column({ type: 'date', nullable: true })
  firstInstallmentDate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  monthlyInstallmentValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commitmentDiscount: number;

  @Column({ type: 'int', default: 0 })
  lossCommitment: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  followUpLockBy: number;

  @Column({ type: 'timestamp', nullable: true })
  followUpLockAt: Date;

  @Column({ nullable: true })
  followedBy: number;

  @Column({ default: false })
  isCanNotContact: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => ContractParty, (party) => party.contract, { cascade: true })
  parties: ContractParty[];

  @OneToMany(() => ContractItem, (item) => item.contract, { cascade: true })
  items: ContractItem[];

  @OneToMany(() => ContractInstallment, (inst) => inst.contract, { cascade: true })
  installments: ContractInstallment[];
}

@Entity('contract_parties')
@Index(['tenantId', 'contractId'])
@Index(['tenantId', 'customerId'])
export class ContractParty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (c) => c.parties)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column()
  customerId: number;

  @Column({ length: 20 })
  customerType: string;

  @Column({ nullable: true })
  loanNumber: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('contract_items')
@Index(['tenantId', 'contractId'])
export class ContractItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (c) => c.items)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ nullable: true, length: 100 })
  serialNumber: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
}

@Entity('contract_installments')
@Index(['tenantId', 'contractId'])
@Index(['tenantId', 'dueDate'])
@Index(['tenantId', 'status'])
export class ContractInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  contractId: number;

  @ManyToOne(() => Contract, (c) => c.installments)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
  status: InstallmentStatus;

  @Column({ nullable: true })
  transactionId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
