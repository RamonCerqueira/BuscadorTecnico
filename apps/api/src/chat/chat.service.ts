import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from './chat.gateway';
import { WhatsappService } from '../notifications/whatsapp.service';
import { maskSensitiveData } from './security.utils';

type CreateMessageInput = CreateMessageDto & { senderId: string };

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly whatsappService: WhatsappService
  ) {}

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

    const sanitizedContent = maskSensitiveData(body.content);

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: body.senderId,
        content: sanitizedContent,
        mediaUrls: body.mediaUrls || []
      },
      include: {
        sender: { select: { id: true, name: true, userType: true } }
      }
    });

    this.chatGateway.emitMessage(ticketId, message);

    // Notificar por WhatsApp o destinatário com a mensagem mascarada
    const receiverId = isOwner ? ticket.assignedToId : ticket.clientId;
    if (receiverId) {
      this.prisma.user.findUnique({ where: { id: receiverId } }).then(receiver => {
        if (receiver?.phone) {
          this.whatsappService.notifyChatMsg(receiver.phone, sender.name, sanitizedContent);
        }
      });
    }

    return message;
  }
}
