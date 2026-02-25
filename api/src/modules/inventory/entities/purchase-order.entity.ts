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
import { Supplier } from './supplier.entity';

@Entity('purchase_orders')
@Index(['tenantId', 'supplierId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'orderDate'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true, length: 50 })
  orderNumber: string;

  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'date' })
  orderDate: string;

  @Column({ type: 'date', nullable: true })
  expectedDate: string;

  @Column({ type: 'date', nullable: true })
  receivedDate: string;

  @Column({ type: 'jsonb', nullable: true })
  items: Record<string, any>[];

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'draft', length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
