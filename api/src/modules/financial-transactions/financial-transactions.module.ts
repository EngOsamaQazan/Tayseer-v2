import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialTransactionsController } from './financial-transactions.controller';
import { FinancialTransactionsService } from './financial-transactions.service';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialTransaction,
      Contract,
      Customer,
      Company,
    ]),
  ],
  providers: [FinancialTransactionsService],
  controllers: [FinancialTransactionsController],
  exports: [FinancialTransactionsService],
})
export class FinancialTransactionsModule {}
