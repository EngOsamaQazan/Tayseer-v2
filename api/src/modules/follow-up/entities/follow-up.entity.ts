import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum FollowUpStatus {
  PENDING = 'pending',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum FollowUpType {
  CALL = 'call',
  VISIT = 'visit',
  SMS = 'sms',
  LEGAL = 'legal',
  OTHER = 'other',
}

@Entity('follow_ups')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'followUpDate'])
export class FollowUp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  contractId: number;

  @Column({ type: 'enum', enum: FollowUpType, default: FollowUpType.CALL })
  type: FollowUpType;

  @Column({ type: 'enum', enum: FollowUpStatus, default: FollowUpStatus.PENDING })
  status: FollowUpStatus;

  @Column({ type: 'date' })
  followUpDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ nullable: true })
  assignedTo: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
