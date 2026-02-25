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

@Entity('system_settings')
@Unique(['tenantId', 'key'])
@Index(['tenantId', 'category'])
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ length: 50, default: 'general' })
  category: string;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ length: 50, default: 'string' })
  valueType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
