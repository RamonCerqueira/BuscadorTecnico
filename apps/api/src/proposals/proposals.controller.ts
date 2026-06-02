import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { SubscribedGuard } from '../auth/subscribed.guard';

@Controller('tickets/:ticketId/proposals')
@UseGuards(JwtAuthGuard, RolesGuard, SubscribedGuard)
export class TicketProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @Roles('technician', 'company')
  create(@Param('ticketId') ticketId: string, @Body() body: CreateProposalDto, @CurrentUser() user: AuthUser) {
    return this.proposalsService.create(ticketId, { ...body, providerId: user.sub });
  }

  @Get()
  @Roles('client', 'technician', 'company', 'admin')
  list(@Param('ticketId') ticketId: string) {
    return this.proposalsService.listByTicket(ticketId);
  }

  @Patch(':proposalId/update-amount')
  @Roles('technician', 'company')
  updateAmount(
    @Param('ticketId') ticketId: string,
    @Param('proposalId') proposalId: string,
    @Body('amount') amount: number,
    @CurrentUser() user: AuthUser
  ) {
    return this.proposalsService.updateAmount(ticketId, proposalId, amount, user.sub);
  }
}

@Controller('proposals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProposalsDecisionController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post(':proposalId/accept')
  @Roles('client')
  accept(@Param('proposalId') proposalId: string, @CurrentUser() user: AuthUser) {
    return this.proposalsService.accept(proposalId, user.sub);
  }

  @Post(':proposalId/reject')
  @Roles('client')
  reject(@Param('proposalId') proposalId: string, @CurrentUser() user: AuthUser) {
    return this.proposalsService.reject(proposalId, user.sub);
  }

  @Post(':proposalId/sign')
  @Roles('client')
  sign(
    @Param('proposalId') proposalId: string,
    @Body('signatureHash') signatureHash: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.proposalsService.signProposal(proposalId, user.sub, signatureHash);
  }
}
