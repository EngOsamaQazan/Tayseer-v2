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

@Entity('employees')
@Index(['tenantId', 'userId'], { unique: true })
@Index(['tenantId', 'employeeCode'])
export class Employee {
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

  @Column({ nullable: true, length: 20 })
  employeeCode: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  basicSalary: number;

  @Column({ nullable: true, length: 50 })
  grade: string;

  @Column({ type: 'jsonb', nullable: true })
  shift: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  documents: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  salaryComponents: Record<string, any>[];

  @Column({ default: false })
  isFieldStaff: boolean;

  @Column({ nullable: true, length: 20 })
  trackingMode: string;

  @Column({ type: 'jsonb', nullable: true })
  workZone: Record<string, any>;

  @Column({ nullable: true, length: 50 })
  department: string;

  @Column({ nullable: true, length: 50 })
  position: string;

  @Column({ type: 'date', nullable: true })
  hireDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ nullable: true, length: 20 })
  employmentType: string;

  @Column({ nullable: true, length: 20 })
  status: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
