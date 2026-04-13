import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

type CreateMessageInput = CreateMessageDto & { senderId: string };

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ticketId: string) {
    return this.prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, userType: true } }
      }
    });
  }

  async create(ticketId: string, body: CreateMessageInput) {
    const [ticket, sender] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: ticketId } }),
      this.prisma.user.findUnique({ where: { id: body.senderId } })
    ]);

    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (!sender) throw new NotFoundException('Usuário remetente não encontrado');

    const isOwner = ticket.clientId === body.senderId;
    const isAssignedProvider = ticket.assignedToId === body.senderId;
    if (!isOwner && !isAssignedProvider) {
      throw new BadRequestException('Somente cliente dono ou prestador atribuído pode enviar mensagem');
    }

    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: body.senderId,
        content: body.content
      }
    });
  }
}
