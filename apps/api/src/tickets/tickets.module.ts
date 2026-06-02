import { Module } from '@nestjs/common';
import { MarketplaceController, TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AiModule, PrismaModule, NotificationsModule],
  controllers: [TicketsController, MarketplaceController],
  providers: [TicketsService],
  exports: [TicketsService]
})
export class TicketsModule {}
