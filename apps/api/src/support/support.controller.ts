import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.create(user.sub, dto);
  }

  @Get()
  findAllForUser(@CurrentUser() user: AuthUser) {
    return this.supportService.findAllForUser(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }
}
