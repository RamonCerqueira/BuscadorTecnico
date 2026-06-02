import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post('tickets/:ticketId/refunds')
  @Roles('technician', 'company')
  create(
    @Param('ticketId') ticketId: string,
    @Body() body: CreateRefundDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.refundsService.createRefund(ticketId, user.sub, body);
  }

  @Get('tickets/:ticketId/refunds')
  list(@Param('ticketId') ticketId: string, @CurrentUser() user: AuthUser) {
    return this.refundsService.getRefundsByTicket(ticketId, user.sub);
  }

  @Patch('refunds/:id/approve')
  @Roles('client')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.refundsService.approveRefund(id, user.sub);
  }

  @Patch('refunds/:id/reject')
  @Roles('client')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.refundsService.rejectRefund(id, user.sub);
  }
}
