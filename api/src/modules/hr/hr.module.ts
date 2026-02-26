import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { Employee, Attendance, PayrollRun } from './entities/hr.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance, PayrollRun])],
  providers: [HrService],
  controllers: [HrController],
  exports: [HrService],
})
export class HrModule {}
