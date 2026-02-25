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

@Entity('payroll_runs')
@Unique(['tenantId', 'period'])
@Index(['tenantId', 'status'])
export class PayrollRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 7 })
  period: string;

  @Column({ default: 'draft', length: 20 })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  payslips: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  totals: Record<string, any>;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
