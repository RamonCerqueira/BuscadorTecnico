import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

@Controller('tickets/:ticketId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @Roles('client', 'technician', 'company', 'admin')
  list(@Param('ticketId') ticketId: string) {
    return this.chatService.list(ticketId);
  }

  @Post()
  @Roles('client', 'technician', 'company')
  create(@Param('ticketId') ticketId: string, @Body() body: CreateMessageDto, @CurrentUser() user: AuthUser) {
    return this.chatService.create(ticketId, { ...body, senderId: user.sub });
  }
}
