import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { Equipment } from '../entities/equipment.entity';
import { AncientArtifact } from '../entities/ancient-artifact.entity';
import { Inventory } from '../entities/inventory.entity';
import { Item } from '../entities/item.entity';
import { Character } from '../entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, AncientArtifact, Inventory, Item, Character])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}

