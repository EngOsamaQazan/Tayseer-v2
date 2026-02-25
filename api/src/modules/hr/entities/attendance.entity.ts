import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('attendance')
@Unique(['tenantId', 'userId', 'date'])
@Index(['tenantId', 'date'])
@Index(['tenantId', 'userId'])
export class Attendance {
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

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'timestamp', nullable: true })
  checkIn: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOut: Date;

  @Column({ nullable: true, length: 20 })
  status: string;

  @Column({ default: 0 })
  lateMinutes: number;

  @Column({ default: 0 })
  overtimeMinutes: number;

  @Column({ type: 'jsonb', nullable: true })
  location: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
