import { Module } from '@nestjs/common';
import { ProposalsDecisionController, TicketProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TicketProposalsController, ProposalsDecisionController],
  providers: [ProposalsService]
})
export class ProposalsModule {}
