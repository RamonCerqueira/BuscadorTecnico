import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('tickets/:ticketId/messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(@Param('ticketId') ticketId: string) {
    return this.chatService.list(ticketId);
  }

  @Post()
  create(@Param('ticketId') ticketId: string, @Body() body: CreateMessageDto) {
    return this.chatService.create(ticketId, body);
  }
}
