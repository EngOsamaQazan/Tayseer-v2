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

@Entity('notifications')
@Index(['tenantId', 'userId', 'isRead'])
@Index(['tenantId', 'type'])
@Index(['tenantId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  userId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ length: 50 })
  type: string;

  @Column({ nullable: true, length: 50 })
  entityType: string;

  @Column({ nullable: true })
  entityId: number;

  @Column({ nullable: true, length: 500 })
  actionUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
