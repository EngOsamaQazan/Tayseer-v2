import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudiciaryCase, JudiciaryAction } from './entities/judiciary.entity';
import { JudiciaryService } from './judiciary.service';
import { JudiciaryController } from './judiciary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JudiciaryCase, JudiciaryAction])],
  providers: [JudiciaryService],
  controllers: [JudiciaryController],
  exports: [JudiciaryService],
})
export class JudiciaryModule {}
