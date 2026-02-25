import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { Income } from './entities/income.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { FinancialTransactionsModule } from '../financial-transactions/financial-transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income, Contract]),
    FinancialTransactionsModule,
  ],
  providers: [IncomeService],
  controllers: [IncomeController],
  exports: [IncomeService],
})
export class IncomeModule {}
