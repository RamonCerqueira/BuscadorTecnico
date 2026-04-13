import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProposalStatus, TicketStatus, UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

type CreateProposalInput = CreateProposalDto & { providerId: string };

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketId: string, body: CreateProposalInput) {
    const [ticket, provider] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: ticketId } }),
      this.prisma.user.findUnique({ where: { id: body.providerId } })
    ]);

    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (!provider) throw new NotFoundException('Prestador não encontrado');

    if (![UserType.technician, UserType.company].includes(provider.userType)) {
      throw new BadRequestException('Apenas técnico ou empresa pode enviar proposta');
    }

    if (ticket.status !== TicketStatus.open && ticket.status !== TicketStatus.quoted) {
      throw new BadRequestException('Ticket não está recebendo propostas');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        ticketId,
        providerId: body.providerId,
        message: body.message,
        estimatedValue: body.estimatedValue,
        status: ProposalStatus.pending
      }
    });

    if (ticket.status === TicketStatus.open) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.quoted }
      });
    }

    return proposal;
  }

  listByTicket(ticketId: string) {
    return this.prisma.proposal.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        provider: { select: { id: true, name: true, userType: true, rating: true } }
      }
    });
  }

  async accept(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ticket: true }
    });

    if (!proposal) throw new NotFoundException('Proposta não encontrada');
    if (proposal.ticket.clientId !== clientId) {
      throw new BadRequestException('Apenas o dono do ticket pode aceitar proposta');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.proposal.updateMany({
        where: {
          ticketId: proposal.ticketId,
          id: { not: proposal.id },
          status: ProposalStatus.pending
        },
        data: { status: ProposalStatus.rejected }
      });

      const accepted = await tx.proposal.update({
        where: { id: proposal.id },
        data: { status: ProposalStatus.accepted }
      });

      await tx.ticket.update({
        where: { id: proposal.ticketId },
        data: {
          status: TicketStatus.in_progress,
          assignedToId: proposal.providerId
        }
      });

      return accepted;
    });
  }

  async reject(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ticket: true }
    });

    if (!proposal) throw new NotFoundException('Proposta não encontrada');
    if (proposal.ticket.clientId !== clientId) {
      throw new BadRequestException('Apenas o dono do ticket pode rejeitar proposta');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: ProposalStatus.rejected }
    });
  }
}
