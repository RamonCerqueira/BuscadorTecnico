import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRefund(ticketId: string, providerId: string, data: CreateRefundDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    if (ticket.assignedToId !== providerId) {
      throw new ForbiddenException('Apenas o técnico atribuído a este chamado pode solicitar reembolso.');
    }

    return this.prisma.materialRefund.create({
      data: {
        ticketId,
        providerId,
        description: data.description,
        amount: data.amount,
        receiptUrl: data.receiptUrl,
      },
    });
  }

  async approveRefund(refundId: string, clientId: string) {
    const refund = await this.prisma.materialRefund.findUnique({
      where: { id: refundId },
      include: { ticket: true },
    });

    if (!refund) throw new NotFoundException('Solicitação de reembolso não encontrada');
    if (refund.ticket.clientId !== clientId) {
      throw new ForbiddenException('Apenas o cliente dono do chamado pode aprovar este reembolso.');
    }

    return this.prisma.materialRefund.update({
      where: { id: refundId },
      data: { status: 'approved' },
    });
  }

  async rejectRefund(refundId: string, clientId: string) {
    const refund = await this.prisma.materialRefund.findUnique({
      where: { id: refundId },
      include: { ticket: true },
    });

    if (!refund) throw new NotFoundException('Solicitação de reembolso não encontrada');
    if (refund.ticket.clientId !== clientId) {
      throw new ForbiddenException('Apenas o cliente dono do chamado pode rejeitar este reembolso.');
    }

    return this.prisma.materialRefund.update({
      where: { id: refundId },
      data: { status: 'rejected' },
    });
  }

  async getRefundsByTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    if (ticket.clientId !== userId && ticket.assignedToId !== userId) {
      throw new ForbiddenException('Sem permissão para visualizar os reembolsos deste chamado.');
    }

    return this.prisma.materialRefund.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
