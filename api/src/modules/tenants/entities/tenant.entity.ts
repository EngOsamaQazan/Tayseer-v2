import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index({ unique: true })
  name: string;

  @Column({ length: 100, unique: true })
  @Index()
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  plan: string;

  @Column({ type: 'date', nullable: true })
  subscriptionStart: Date;

  @Column({ type: 'date', nullable: true })
  subscriptionEnd: Date;

  @Column({ nullable: true })
  maxUsers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
