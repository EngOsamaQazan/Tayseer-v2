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

@Entity('inventory_items')
@Index(['tenantId', 'sku'], { unique: true })
@Index(['tenantId', 'categoryId'])
export class InventoryItem {
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

  @Column({ nullable: true, length: 50 })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true, length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sellPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxStock: number;

  @Column({ nullable: true, length: 255 })
  location: string;

  @Column({ nullable: true, length: 100 })
  barcode: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ default: 'active', length: 20 })
  status: string;

  @Column({ nullable: true })
  supplierId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
