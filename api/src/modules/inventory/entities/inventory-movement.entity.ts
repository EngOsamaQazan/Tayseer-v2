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
import { InventoryItem } from './inventory-item.entity';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

@Entity('inventory_movements')
@Index(['tenantId', 'itemId'])
@Index(['tenantId', 'type'])
@Index(['tenantId', 'date'])
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  itemId: number;

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalPrice: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  purchaseOrderId: number;

  @Column({ nullable: true })
  contractId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
