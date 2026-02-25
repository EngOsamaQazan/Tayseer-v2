import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ length: 50 })
  phoneNumber: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true, length: 255 })
  socialSecurityNumber: string;

  @Column({ nullable: true, length: 255 })
  taxNumber: string;

  @Column({ default: false })
  isPrimaryCompany: boolean;

  @Column({ type: 'int', nullable: true })
  totalShares: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  investedCapital: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  profitShareRatio: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  parentShareRatio: number;

  @Column({ default: false })
  capitalRefundable: boolean;

  @Column({ nullable: true })
  portfolioStatus: string;

  @Column({ type: 'date', nullable: true })
  agreementDate: Date;

  @Column({ type: 'text', nullable: true })
  agreementNotes: string;

  @Column({ type: 'json', nullable: true })
  commercialRegister: any;

  @Column({ type: 'json', nullable: true })
  tradeLicense: any;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => CompanyBank, (bank) => bank.company, { cascade: true })
  bankAccounts: CompanyBank[];
}

@Entity('company_banks')
export class CompanyBank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  companyId: number;

  @ManyToOne(() => Company, (company) => company.bankAccounts)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ length: 100 })
  bankName: string;

  @Column({ length: 255 })
  bankNumber: string;

  @Column({ nullable: true, length: 255 })
  ibanNumber: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
