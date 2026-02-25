import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('follow_ups')
@Index(['tenantId', 'contractId'])
@Index(['tenantId', 'createdBy'])
@Index(['tenantId', 'dateTime'])
export class FollowUp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  contractId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  feelingId: number;

  @Column({ nullable: true })
  connectionGoal: number;

  @Column({ type: 'date', nullable: true })
  reminder: string;

  @Column({ type: 'date', nullable: true })
  promiseToPayAt: string;

  @Column({ nullable: true, length: 50 })
  connectionType: string;

  @Column({ nullable: true })
  connectionResponseId: number;

  @Column({ type: 'text', nullable: true })
  connectionNote: string;

  @Column({ nullable: true })
  customerId: number;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
