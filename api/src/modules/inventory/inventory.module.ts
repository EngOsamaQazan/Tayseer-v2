import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { InventoryService } from './inventory.service';
import { SuppliersService } from './suppliers.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { InventoryController } from './inventory.controller';
import { SuppliersController } from './suppliers.controller';
import { PurchaseOrdersController } from './purchase-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      InventoryMovement,
      Supplier,
      PurchaseOrder,
    ]),
  ],
  providers: [InventoryService, SuppliersService, PurchaseOrdersService],
  controllers: [
    InventoryController,
    SuppliersController,
    PurchaseOrdersController,
  ],
  exports: [InventoryService, SuppliersService, PurchaseOrdersService],
})
export class InventoryModule {}
