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

@Entity('field_sessions')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
export class FieldSession {
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

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ nullable: true, length: 20 })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  locationPoints: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  events: Record<string, any>[];

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalDistanceKm: number;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: Record<string, any>;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
