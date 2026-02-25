import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contract, ContractParty, ContractItem, ContractInstallment,
} from './entities/contract.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractParty, ContractItem, ContractInstallment]),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
