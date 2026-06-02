import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    // Validar JWT no handshake — token pode vir via auth.token ou header Authorization
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`Conexão rejeitada: sem token. Socket: ${client.id}`);
      client.emit('error', { message: 'Token de autenticação ausente' });
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.userType = payload.userType;
      client.data.email = payload.email;
      this.logger.log(`Cliente conectado: ${payload.email} (${client.id})`);
    } catch (err) {
      this.logger.warn(`Conexão rejeitada: token inválido. Socket: ${client.id}`);
      client.emit('error', { message: 'Token inválido ou expirado' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.data?.email || client.id}`);
  }

  @SubscribeMessage('joinTicket')
  handleJoinTicket(@MessageBody() ticketId: string, @ConnectedSocket() client: Socket) {
    if (!client.data?.userId) {
      return { event: 'error', data: 'Não autenticado' };
    }
    client.join(`ticket_${ticketId}`);
    this.logger.log(`Usuário ${client.data.email} entrou na sala ticket_${ticketId}`);
    return { event: 'joined', data: ticketId };
  }

  @SubscribeMessage('leaveTicket')
  handleLeaveTicket(@MessageBody() ticketId: string, @ConnectedSocket() client: Socket) {
    client.leave(`ticket_${ticketId}`);
    return { event: 'left', data: ticketId };
  }

  // Emite mensagem para todos na sala do ticket (chamado pelo ChatService após persistir)
  emitMessage(ticketId: string, message: any) {
    this.server.to(`ticket_${ticketId}`).emit('newMessage', message);
  }
}
