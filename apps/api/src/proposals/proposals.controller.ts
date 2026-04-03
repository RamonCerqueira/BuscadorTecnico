import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { DecisionProposalDto } from './dto/decision-proposal.dto';
import { ProposalsService } from './proposals.service';

@Controller('tickets/:ticketId/proposals')
export class TicketProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(@Param('ticketId') ticketId: string, @Body() body: CreateProposalDto) {
    return this.proposalsService.create(ticketId, body);
  }

  @Get()
  list(@Param('ticketId') ticketId: string) {
    return this.proposalsService.listByTicket(ticketId);
  }
}

@Controller('proposals')
export class ProposalsDecisionController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post(':proposalId/accept')
  accept(@Param('proposalId') proposalId: string, @Body() body: DecisionProposalDto) {
    return this.proposalsService.accept(proposalId, body.clientId);
  }

  @Post(':proposalId/reject')
  reject(@Param('proposalId') proposalId: string, @Body() body: DecisionProposalDto) {
    return this.proposalsService.reject(proposalId, body.clientId);
  }
}
