import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProposalStatus, TicketStatus, UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { WhatsappService } from '../notifications/whatsapp.service';

type CreateProposalInput = CreateProposalDto & { providerId: string };

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly whatsappService: WhatsappService
  ) {}

  async create(ticketId: string, body: CreateProposalInput) {
    const [ticket, provider] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: ticketId } }),
      this.prisma.user.findUnique({ where: { id: body.providerId } })
    ]);

    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (!provider) throw new NotFoundException('Prestador não encontrado');

    if (!([UserType.technician, UserType.company] as any).includes(provider.userType)) {
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
        visitFee: body.visitFee,
        status: ProposalStatus.pending
      }
    });

    if (ticket.status === TicketStatus.open) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.quoted }
      });
    }

    // Notificar o cliente
    this.notificationsService.sendProposalNotification(ticket.clientId, ticket.title, ticket.id).catch(err => {
      console.error('Falha ao enviar notificação interna:', err);
    });

    this.prisma.user.findUnique({ where: { id: ticket.clientId } }).then((client) => {
      if (client?.phone) {
        this.whatsappService.notifyNewProposal(client.phone, client.name, ticket.title, provider.name);
      }
    });

    return proposal;
  }

  listByTicket(ticketId: string) {
    return this.prisma.proposal.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        provider: { select: { id: true, name: true, userType: true, rating: true, specialties: true, certificates: true } }
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

  async updateAmount(ticketId: string, proposalId: string, amount: number, providerId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ticket: true }
    });

    if (!proposal) throw new NotFoundException('Proposta não encontrada');
    if (proposal.ticketId !== ticketId) {
      throw new BadRequestException('Esta proposta não pertence a este ticket');
    }
    if (proposal.providerId !== providerId) {
      throw new BadRequestException('Apenas o prestador dono da proposta pode alterar o valor');
    }
    if (proposal.status !== ProposalStatus.accepted) {
      throw new BadRequestException('Apenas propostas aceitas podem ter o valor atualizado após a visita');
    }
    if (proposal.ticket.status !== TicketStatus.in_progress) {
      throw new BadRequestException('O ticket correspondente deve estar em andamento');
    }

    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { estimatedValue: amount }
    });

    // Enviar notificação ao cliente informando do novo orçamento definido pelo técnico
    this.notificationsService.create({
      userId: proposal.ticket.clientId,
      title: 'Orçamento Atualizado',
      message: `O técnico atualizou o valor do orçamento do chamado "${proposal.ticket.title}" para R$ ${amount}.`,
      type: 'proposal',
      link: `/tickets/${proposal.ticketId}`
    }).catch(err => console.error('Notificação de orçamento atualizado falhou:', err));

    return updated;
  }

  async signProposal(proposalId: string, clientId: string, signatureHash: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ticket: true }
    });

    if (!proposal) throw new NotFoundException('Proposta não encontrada');
    if (proposal.ticket.clientId !== clientId) {
      throw new BadRequestException('Apenas o cliente do chamado pode assinar esta proposta.');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        signedAt: new Date(),
        signatureHash
      }
    });
  }
}
