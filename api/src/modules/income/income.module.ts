import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import {
  Contract,
  ContractInstallment,
} from '../contracts/entities/contract.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income, Contract, ContractInstallment]),
  ],
  providers: [IncomeService],
  controllers: [IncomeController],
  exports: [IncomeService],
})
export class IncomeModule {}
