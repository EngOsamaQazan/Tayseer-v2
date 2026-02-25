import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CustomersModule } from './modules/customers/customers.module';
import { FinancialTransactionsModule } from './modules/financial-transactions/financial-transactions.module';
import { AuditModule } from './modules/audit/audit.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { CourtsModule } from './modules/courts/courts.module';
import { LawyersModule } from './modules/lawyers/lawyers.module';
import { JudiciaryModule } from './modules/judiciary/judiciary.module';
import { CollectionModule } from './modules/collection/collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development',
        logging: false,
      }),
    }),
    AuditModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    LookupsModule,
    CategoriesModule,
    CompaniesModule,
    CustomersModule,
    FinancialTransactionsModule,
    ContractsModule,
    FollowUpModule,
    CourtsModule,
    LawyersModule,
    JudiciaryModule,
    CollectionModule,
  ],
})
export class AppModule {}
