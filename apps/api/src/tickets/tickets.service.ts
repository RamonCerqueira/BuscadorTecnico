import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CompleteTicketDto } from './dto/complete-ticket.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { AiService } from '../ai/ai.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notifications: NotificationsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(data: CreateTicketDto & { clientId: string }) {
    const aiInsights = data.aiInsights || await this.aiService.getDiagnostic(data.description);

    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        locationText: data.locationText,
        category: data.category,
        mediaUrls: data.mediaUrls || [],
        aiInsights,
        clientId: data.clientId,
        status: TicketStatus.open
      }
    });

    // 4.1 — Match automático técnico-chamado com IA
    try {
      const professionals = await this.prisma.user.findMany({
        where: { userType: { in: ['technician', 'company'] } },
        select: { id: true, name: true, specialties: true, bio: true }
      });

      const matchResult = await this.aiService.matchTechnicians(data.description, professionals);

      if (matchResult && matchResult.matchedIds.length > 0) {
        for (const matchedId of matchResult.matchedIds) {
          await this.notifications.create({
            userId: matchedId,
            title: '🎯 Oportunidade por IA',
            message: `Você foi selecionado por nossa inteligência artificial como altamente compatível para o chamado: "${data.title}"!`,
            type: 'proposal',
            link: `/tickets/${ticket.id}`
          });
        }
      }
    } catch (e) {
      console.error('Erro ao rodar match automático técnico-chamado:', e);
    }

    return ticket;
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
        assignedTo: { select: { id: true, name: true, avatarUrl: true, rating: true, totalReviews: true } },
        proposals: {
          include: {
            provider: { select: { id: true, name: true, avatarUrl: true, rating: true, totalReviews: true } }
          }
        }
      }
    });

    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    return ticket;
  }

  async listByClient(clientId: string, status?: TicketStatus, cursor?: string, limit = 20) {
    const items = await this.prisma.ticket.findMany({
      take: limit + 1,
      where: {
        clientId,
        status: status ? status : undefined
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: items,
      nextCursor
    };
  }

  async listByProvider(providerId: string, status?: TicketStatus, cursor?: string, limit = 20) {
    const items = await this.prisma.ticket.findMany({
      take: limit + 1,
      where: {
        assignedToId: providerId,
        status: status ? status : undefined
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: items,
      nextCursor
    };
  }

  async listProposalsByProvider(providerId: string, cursor?: string, limit = 20) {
    const items = await this.prisma.proposal.findMany({
      take: limit + 1,
      where: {
        providerId
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          include: {
            client: { select: { id: true, name: true } }
          }
        }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: items,
      nextCursor
    };
  }

  async list(status?: TicketStatus, cursor?: string, limit = 20) {
    const items = await this.prisma.ticket.findMany({
      take: limit + 1,
      where: status ? { status } : undefined,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: items,
      nextCursor
    };
  }

  async listMarketplaceOpen(cursor?: string, limit = 20) {
    const cacheKey = `tickets:marketplace:${cursor || 'start'}:${limit}`;
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      console.error('Erro ao ler cache Redis:', e);
    }

    const items = await this.prisma.ticket.findMany({
      take: limit + 1,
      where: { status: TicketStatus.open },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true } },
        proposals: {
          where: { status: 'pending' },
          select: { id: true }
        }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    const result = {
      data: items,
      nextCursor
    };

    try {
      await this.cacheManager.set(cacheKey, result, 30000); // 30s cache
    } catch (e) {
      console.error('Erro ao gravar cache Redis:', e);
    }

    return result;
  }

  async complete(ticketId: string, clientId: string, data: CompleteTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (ticket.clientId !== clientId) {
      throw new BadRequestException('Apenas o dono do ticket pode concluí-lo');
    }
    if (ticket.status !== TicketStatus.in_progress) {
      throw new BadRequestException('O chamado deve estar em andamento para ser concluído');
    }
    if (!ticket.assignedToId) {
      throw new BadRequestException('Não há um prestador atribuído a este chamado');
    }

    const providerId = ticket.assignedToId;

    return this.prisma.$transaction(async (tx) => {
      // 1. Criar a avaliação
      const review = await tx.review.create({
        data: {
          ticketId,
          clientId,
          providerId,
          rating: data.rating,
          comment: data.comment
        }
      });

      // 2. Buscar o pagamento para saber o valor a liberar
      const payment = await tx.payment.findFirst({
        where: { ticketId, status: 'paid' }
      });
      const releaseAmount = payment ? Number(payment.amount) : 0;

      // 3. Atualizar status do ticket e liberar pagamento
      await tx.ticket.update({
        where: { id: ticketId },
        data: { 
          status: TicketStatus.resolved,
          paymentStatus: 'released'
        }
      });

      // 4. Atualizar métricas do técnico e liberar SALDO
      const provider = await tx.user.findUnique({
        where: { id: providerId },
        select: { rating: true, totalReviews: true, balance: true, escrowBalance: true }
      });

      if (provider) {
        const newTotal = provider.totalReviews + 1;
        const newRating = (provider.rating * provider.totalReviews + data.rating) / newTotal;

        await tx.user.update({
          where: { id: providerId },
          data: {
            rating: newRating,
            totalReviews: newTotal,
            balance: { increment: releaseAmount },
            escrowBalance: { decrement: releaseAmount }
          }
        });

        // 5. Notificar técnico da liberação do pagamento
        if (releaseAmount > 0) {
          this.notifications.sendReleaseNotification(providerId, releaseAmount.toFixed(2), ticketId).catch(() => {});
        }
      }

      return review;
    });
  }

  async report(ticketId: string, userId: string, data: CreateReportDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const report = await this.prisma.ticketReport.create({
      data: {
        ticketId,
        reporterId: userId,
        reason: data.reason,
        description: data.description
      }
    });

    // Marcar ticket como disputado
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.disputed }
    });

    return report;
  }

  async generateTechnicalReport(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: { select: { name: true } },
        assignedTo: { select: { name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true } } }
        }
      }
    });

    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    if (ticket.clientId !== userId && ticket.assignedToId !== userId) {
      throw new BadRequestException('Apenas o cliente ou o técnico deste chamado podem gerar o laudo técnico.');
    }

    const messages = ticket.messages.map(m => ({
      senderName: m.sender.name,
      content: m.content,
      createdAt: m.createdAt
    }));

    const markdownReport = await this.aiService.generateServiceReport(
      { title: ticket.title, description: ticket.description, category: ticket.category },
      ticket.client.name,
      ticket.assignedTo?.name || 'Não atribuído',
      messages
    );

    return {
      reportMarkdown: markdownReport,
      ticketId,
      generatedAt: new Date()
    };
  }
}
