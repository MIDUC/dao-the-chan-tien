import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { Quest } from '../entities/quest.entity';
import { CharacterQuest } from '../entities/character-quest.entity';
import { Character } from '../entities/character.entity';
import { Item } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';
import { CurrencyModule } from '../currency/currency.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, CharacterQuest, Character, Item, Inventory]),
    CurrencyModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}

