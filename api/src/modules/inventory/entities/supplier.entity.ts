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

@Entity('suppliers')
@Index(['tenantId', 'name'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true, length: 255 })
  contactPerson: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true, length: 50 })
  taxNumber: string;

  @Column({ nullable: true, length: 50 })
  bankAccount: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'active', length: 20 })
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
