import { Controller, Get, Post, Body, Patch, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    const userId = user?.sub || (user as any)?.id;
    if (!userId) throw new UnauthorizedException('User ID is missing from token payload');
    return this.notificationsService.findAll(userId);
  }

  @Get('vapid-key')
  getVapidKey() {
    return this.notificationsService.getVapidKey();
  }

  @Post('subscribe')
  subscribe(@Body() body: any, @CurrentUser() user: AuthUser) {
    const userId = user?.sub || (user as any)?.id;
    if (!userId) throw new UnauthorizedException('User ID is missing');
    return this.notificationsService.subscribe(userId, body);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const userId = user?.sub || (user as any)?.id;
    if (!userId) throw new UnauthorizedException('User ID is missing');
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: AuthUser) {
    const userId = user?.sub || (user as any)?.id;
    if (!userId) throw new UnauthorizedException('User ID is missing');
    return this.notificationsService.markAllAsRead(userId);
  }
}
