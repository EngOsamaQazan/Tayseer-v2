import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryItem, InventoryMovement, Supplier } from './entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryMovement, Supplier])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
