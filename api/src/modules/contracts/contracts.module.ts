import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contract,
  ContractItem,
  ContractInstallment,
  ContractGuarantor,
} from './entities/contract.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      ContractItem,
      ContractInstallment,
      ContractGuarantor,
    ]),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
