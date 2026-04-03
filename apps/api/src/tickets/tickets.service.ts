import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        locationText: data.locationText,
        clientId: data.clientId,
        status: TicketStatus.open
      }
    });
  }

  list(status?: TicketStatus) {
    return this.prisma.ticket.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });
  }

  listMarketplaceOpen() {
    return this.prisma.ticket.findMany({
      where: { status: TicketStatus.open },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        proposals: {
          where: { status: 'pending' },
          select: { id: true }
        }
      }
    });
  }
}
