import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // 1. Create a Coupon (Technicians and Companies)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(user.sub, createCouponDto);
  }

  // 2. List all coupons created by the logged provider
  @Get('provider')
  findAllForProvider(@CurrentUser() user: AuthUser) {
    return this.couponsService.findAllForProvider(user.sub);
  }

  // 3. Explore active coupons (Clients view)
  @Get('explore')
  exploreActive() {
    return this.couponsService.exploreActive();
  }

  // 4. Toggle active status
  @Patch(':id/toggle')
  toggleActive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.couponsService.toggleActive(user.sub, id);
  }

  // 5. Delete a Coupon
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.couponsService.remove(user.sub, id);
  }

  // 6. Validate code (called from proposal/ticket payment checkout)
  @Get('validate')
  validateCoupon(
    @Query('code') code: string,
    @Query('amount') amount: string
  ) {
    return this.couponsService.validateCoupon(code, Number(amount || 0));
  }
}
