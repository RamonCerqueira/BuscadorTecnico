import { Module } from '@nestjs/common';
import { ProposalsDecisionController, TicketProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  controllers: [TicketProposalsController, ProposalsDecisionController],
  providers: [ProposalsService]
})
export class ProposalsModule {}
