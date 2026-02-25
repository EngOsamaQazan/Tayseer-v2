import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lawyer } from './entities/lawyer.entity';
import { LawyersService } from './lawyers.service';
import { LawyersController } from './lawyers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lawyer])],
  providers: [LawyersService],
  controllers: [LawyersController],
  exports: [LawyersService],
})
export class LawyersModule {}
