import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CompleteTicketDto } from './dto/complete-ticket.dto';
import { FinalizeTechDto } from './dto/finalize-tech.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { SubscribedGuard } from '../auth/subscribed.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('client')
  create(@Body() body: CreateTicketDto, @CurrentUser() user: AuthUser) {
    return this.ticketsService.create({ ...body, clientId: user.sub });
  }

  @Get('my-jobs')
  @Roles('technician', 'company')
  myJobs(
    @Query('status') status?: TicketStatus,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: AuthUser
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    if (!user) throw new Error('User is required');
    return this.ticketsService.listByProvider(user.sub, status, cursor, parsedLimit);
  }

  @Get('my-proposals')
  @Roles('technician', 'company')
  myProposals(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: AuthUser
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    if (!user) throw new Error('User is required');
    return this.ticketsService.listProposalsByProvider(user.sub, cursor, parsedLimit);
  }

  @Get()
  @Roles('client', 'technician', 'company', 'admin')
  list(
    @Query('status') status?: TicketStatus,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: AuthUser
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    if (user?.userType === 'client') {
      return this.ticketsService.listByClient(user.sub, status, cursor, parsedLimit);
    }
    return this.ticketsService.list(status, cursor, parsedLimit);
  }

  @Get(':id')
  @Roles('client', 'technician', 'company', 'admin')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/complete')
  @Roles('client')
  complete(
    @Param('id') id: string,
    @Body() body: CompleteTicketDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.ticketsService.complete(id, user.sub, body);
  }

  @Patch(':id/finalize-tech')
  @Roles('technician', 'company')
  finalizeTech(
    @Param('id') id: string,
    @Body() body: FinalizeTechDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.ticketsService.finalizeTech(id, user.sub, body.amount);
  }

  @Post(':id/report')
  report(
    @Param('id') id: string,
    @Body() body: CreateReportDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.ticketsService.report(id, user.sub, body);
  }

  @Post(':id/review')
  @Roles('client', 'technician', 'company')
  createReview(
    @Param('id') id: string,
    @Body() body: CompleteTicketDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.ticketsService.createReview(id, user.sub, body);
  }

  @Get('reviews/received')
  @Roles('client', 'technician', 'company')
  getReceivedReviews(@CurrentUser() user: AuthUser) {
    return this.ticketsService.getReceivedReviews(user.sub);
  }

  @Get('reviews/pending')
  @Roles('client', 'technician', 'company')
  getPendingReviews(@CurrentUser() user: AuthUser) {
    return this.ticketsService.getPendingReviews(user.sub);
  }

  @Post(':id/tech-report')
  generateTechReport(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.ticketsService.generateTechnicalReport(id, user.sub);
  }
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('tickets')
  openTickets(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.ticketsService.listMarketplaceOpen(cursor, parsedLimit);
  }
}
