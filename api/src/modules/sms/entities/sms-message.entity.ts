import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('sms_messages')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'recipientNumber'])
@Index(['tenantId', 'createdAt'])
export class SmsMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 20 })
  recipientNumber: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'pending', length: 20 })
  status: string;

  @Column({ nullable: true, length: 50 })
  type: string;

  @Column({ nullable: true, length: 50 })
  entityType: string;

  @Column({ nullable: true })
  entityId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  contractId: number;

  @Column({ nullable: true, length: 100 })
  provider: string;

  @Column({ nullable: true, length: 255 })
  providerMessageId: string;

  @Column({ type: 'text', nullable: true })
  providerResponse: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
