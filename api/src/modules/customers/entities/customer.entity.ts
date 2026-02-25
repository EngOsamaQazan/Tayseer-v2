import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('customers')
@Index(['tenantId', 'idNumber'], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  jobTitle: number;

  @Column({ nullable: true, length: 50 })
  idNumber: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true })
  sex: number;

  @Column({ nullable: true, length: 20 })
  @Index()
  primaryPhoneNumber: string;

  @Column({ nullable: true })
  citizen: string;

  @Column({ nullable: true })
  hearAboutUs: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankBranch: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  isSocialSecurity: number;

  @Column({ nullable: true })
  socialSecurityNumber: string;

  @Column({ nullable: true })
  doHaveAnyProperty: number;

  @Column({ nullable: true })
  propertyName: string;

  @Column({ nullable: true })
  propertyNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  hasSocialSecuritySalary: string;

  @Column({ nullable: true })
  socialSecuritySalarySource: string;

  @Column({ nullable: true })
  retirementStatus: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalRetirementIncome: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalSalary: number;

  @Column({ nullable: true })
  facebookAccount: string;

  @Column({ nullable: true, length: 20 })
  jobNumber: string;

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

  @OneToMany(() => CustomerAddress, (addr) => addr.customer, { cascade: true })
  addresses: CustomerAddress[];

  @OneToMany(() => CustomerPhone, (phone) => phone.customer, { cascade: true })
  phoneNumbers: CustomerPhone[];
}

@Entity('customer_addresses')
export class CustomerAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.addresses)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  building: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  apartment: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('customer_phones')
export class CustomerPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.phoneNumbers)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ nullable: true })
  phoneType: string;

  @Column({ nullable: true })
  ownerName: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
