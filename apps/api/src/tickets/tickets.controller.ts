import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('client')
  create(@Body() body: CreateTicketDto, @CurrentUser() user: AuthUser) {
    return this.ticketsService.create({ ...body, clientId: user.sub });
  }

  @Get()
  @Roles('client', 'technician', 'company', 'admin')
  list(@Query('status') status?: TicketStatus) {
    return this.ticketsService.list(status);
  }
}

@Controller('marketplace')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketplaceController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('tickets')
  @Roles('technician', 'company', 'admin')
  openTickets() {
    return this.ticketsService.listMarketplaceOpen();
  }
}
