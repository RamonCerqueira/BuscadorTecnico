import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

@Controller('tickets/:ticketId/proposals')
@UseGuards(JwtAuthGuard, RolesGuard)
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
}
