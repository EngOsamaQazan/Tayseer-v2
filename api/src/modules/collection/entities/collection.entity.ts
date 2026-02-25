import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum CollectionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('collections')
@Index(['tenantId', 'contractId'])
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'judiciaryCaseId'])
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  contractId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  judiciaryCaseId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'enum', enum: CollectionStatus, default: CollectionStatus.ACTIVE })
  status: CollectionStatus;

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

  @OneToMany(() => CollectionInstallment, (ci) => ci.collection, { cascade: true })
  installments: CollectionInstallment[];
}

export enum CollectionInstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('collection_installments')
@Index(['tenantId', 'collectionId'])
export class CollectionInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  collectionId: number;

  @ManyToOne(() => Collection, (c) => c.installments)
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: CollectionInstallmentStatus,
    default: CollectionInstallmentStatus.PENDING,
  })
  status: CollectionInstallmentStatus;

  @Column({ nullable: true })
  transactionId: number;

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
