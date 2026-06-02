import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('diagnostic')
  @UseGuards(JwtAuthGuard)
  async getDiagnostic(@Body() body: { description: string }) {
    const result = await this.aiService.getDiagnostic(body.description);
    return { result };
  }

  @Get('suggest-price')
  @UseGuards(JwtAuthGuard)
  async suggestPrice(
    @Query('category') category: string,
    @Query('description') description: string,
    @Query('city') city: string
  ) {
    return this.aiService.suggestPricing(category, description, city);
  }
}
