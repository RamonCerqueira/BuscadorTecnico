import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() body: CreateTicketDto) {
    return this.ticketsService.create(body);
  }

  @Get()
  list(@Query('status') status?: TicketStatus) {
    return this.ticketsService.list(status);
  }
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('tickets')
  openTickets() {
    return this.ticketsService.listMarketplaceOpen();
  }
}
