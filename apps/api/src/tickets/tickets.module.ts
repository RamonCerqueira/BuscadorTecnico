import { Module } from '@nestjs/common';
import { MarketplaceController, TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController, MarketplaceController],
  providers: [TicketsService],
  exports: [TicketsService]
})
export class TicketsModule {}
