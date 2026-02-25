import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Court } from '../../courts/entities/court.entity';
import { Lawyer } from '../../lawyers/entities/lawyer.entity';

export enum CaseStatus {
  PREPARATION = 'preparation',
  REGISTERED = 'registered',
  IN_PROGRESS = 'in_progress',
  SUSPENDED = 'suspended',
  DISMISSED = 'dismissed',
  ABANDONED = 'abandoned',
}

@Entity('judiciary_cases')
@Index(['tenantId', 'contractId'])
@Index(['tenantId', 'caseStatus'])
@Index(['tenantId', 'courtId'])
@Index(['tenantId', 'lawyerId'])
export class JudiciaryCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  contractId: number;

  @Column()
  courtId: number;

  @ManyToOne(() => Court)
  @JoinColumn({ name: 'courtId' })
  court: Court;

  @Column({ nullable: true })
  typeId: number;

  @Column()
  lawyerId: number;

  @ManyToOne(() => Lawyer)
  @JoinColumn({ name: 'lawyerId' })
  lawyer: Lawyer;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lawyerCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  caseCost: number;

  @Column({ nullable: true })
  judiciaryNumber: number;

  @Column({ nullable: true, length: 10 })
  year: string;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.IN_PROGRESS })
  caseStatus: CaseStatus;

  @Column({ type: 'date', nullable: true })
  incomeDate: string;

  @Column({ type: 'date', nullable: true })
  lastCheckDate: string;

  @Column({ nullable: true })
  companyId: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  lastUpdatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => JudiciaryAction, (a) => a.judiciaryCase)
  actions: JudiciaryAction[];
}

@Entity('judiciary_actions')
@Index(['tenantId', 'judiciaryCaseId'])
@Index(['tenantId', 'actionDate'])
export class JudiciaryAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  judiciaryCaseId: number;

  @ManyToOne(() => JudiciaryCase, (jc) => jc.actions)
  @JoinColumn({ name: 'judiciaryCaseId' })
  judiciaryCase: JudiciaryCase;

  @Column({ nullable: true })
  customerId: number;

  @Column({ length: 255 })
  actionName: string;

  @Column({ nullable: true, length: 50 })
  actionType: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'timestamp', nullable: true })
  actionDate: Date;

  @Column({ nullable: true, length: 20 })
  requestStatus: string;

  @Column({ type: 'text', nullable: true })
  decisionText: string;

  @Column({ nullable: true, length: 255 })
  decisionFile: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true, length: 20 })
  requestTarget: string;

  @Column({ default: true })
  isCurrent: boolean;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  contractId: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  lastUpdatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
