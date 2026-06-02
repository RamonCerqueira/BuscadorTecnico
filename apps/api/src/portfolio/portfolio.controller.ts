import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician', 'company')
  create(@Body() body: CreatePortfolioDto, @CurrentUser() user: AuthUser) {
    return this.portfolioService.create(user.sub, body);
  }

  @Get('user/:userId')
  listByUser(@Param('userId') userId: string) {
    return this.portfolioService.findByUser(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.portfolioService.remove(id, user.sub);
  }
}
