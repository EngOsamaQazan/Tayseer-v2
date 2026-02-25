import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection, CollectionInstallment } from './entities/collection.entity';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionInstallment])],
  providers: [CollectionService],
  controllers: [CollectionController],
  exports: [CollectionService],
})
export class CollectionModule {}
