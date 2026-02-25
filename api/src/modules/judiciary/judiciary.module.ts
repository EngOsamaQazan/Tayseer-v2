import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudiciaryService } from './judiciary.service';
import { JudiciaryController } from './judiciary.controller';
import { JudiciaryCase } from './entities/judiciary-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JudiciaryCase])],
  providers: [JudiciaryService],
  controllers: [JudiciaryController],
  exports: [JudiciaryService],
})
export class JudiciaryModule {}
