import { Controller, Post, Body, UseGuards, Req, Headers, RawBodyRequest, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');

@Controller('payments')
export class PaymentsController {
  private stripe: any;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-01-27' as any,
    });
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() body: { planId: string; gateway: 'stripe' | 'mercadopago' },
    @CurrentUser() user: AuthUser,
  ) {
    if (body.gateway === 'stripe') {
      return this.paymentsService.createStripeCheckout(user.sub, body.planId);
    } else {
      return this.paymentsService.createMercadoPagoPreference(user.sub, body.planId);
    }
  }

  @Post('checkout/job')
  @UseGuards(JwtAuthGuard)
  async createJobCheckout(
    @Body() body: { ticketId: string; proposalId: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.createJobCheckout(user.sub, body.ticketId, body.proposalId);
  }

  // Webhook para o Stripe — com validação real de assinatura
  @Post('webhook/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<any>,
    @Headers('stripe-signature') sig: string,
  ) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurado');
    }

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        webhookSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(`Assinatura do Webhook Stripe inválida: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { userId, ticketId, proposalId, type, planId } = session.metadata || {};

      if (type === 'job_payment' && ticketId && proposalId) {
        await this.paymentsService.processJobPayment(
          ticketId,
          proposalId,
          session.id,
          session.amount_total ?? 0,
        );
      } else if (userId) {
        await this.paymentsService.processSubscription(userId, planId);
      }
    }

    return { received: true };
  }

  // Webhook para o Mercado Pago — busca o pagamento pela API e processa
  @Post('webhook/mercadopago')
  async mpWebhook(@Body() body: any) {
    if (body.type === 'payment' && body.data?.id) {
      await this.paymentsService.processMpPayment(String(body.data.id));
    }
    return { status: 'ok' };
  }
}
