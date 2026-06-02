import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe = require('stripe');
import { MercadoPagoConfig, Preference } from 'mercadopago';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private stripe: any;
  private mpClient: MercadoPagoConfig;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-01-27' as any,
    });
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.config.get('MP_ACCESS_TOKEN')!,
    });
  }

  async createStripeCheckout(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const amount = planId === 'company' ? 8990 : 2990;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Assinatura TechFix - Plano ${planId === 'company' ? 'Empresa' : 'Técnico'}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.config.get('FRONTEND_URL')}/dashboard?success=true`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/subscription`,
      metadata: { userId, planId },
    });

    return { url: session.url };
  }

  async createMercadoPagoPreference(userId: string, planId: string) {
    const amount = planId === 'company' ? 89.90 : 29.90;
    const preference = new Preference(this.mpClient);

    const result = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Assinatura TechFix - Plano ${planId === 'company' ? 'Empresa' : 'Técnico'}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          },
        ],
        metadata: { userId, planId },
        back_urls: {
          success: `${this.config.get('FRONTEND_URL')}/dashboard`,
          failure: `${this.config.get('FRONTEND_URL')}/subscription`,
        },
        notification_url: `${this.config.get('BACKEND_URL')}/payments/webhook/mercadopago`,
      },
    });

    return { url: result.init_point };
  }

  async createJobCheckout(userId: string, ticketId: string, proposalId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { client: true },
    });
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { provider: true },
    });

    if (!ticket || !proposal) throw new Error('Ticket ou Proposta não encontrados');
    if (ticket.clientId !== userId) throw new Error('Não autorizado');

    const amount = Math.round(Number(proposal.estimatedValue) * 100); // Stripe uses cents
    const takeRate = 0.15; // 15% platform commission
    const applicationFee = Math.round(amount * takeRate);

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Serviço TechFix: ${ticket.title}`,
              description: `Prestador: ${proposal.provider.name}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.config.get('FRONTEND_URL')}/tickets/${ticketId}?payment=success`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/tickets/${ticketId}`,
      metadata: { 
        userId, 
        ticketId, 
        proposalId,
        type: 'job_payment' 
      },
    };

    // If the provider has a Stripe Connect account, split the payment instantly
    if (proposal.provider.stripeConnectAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: proposal.provider.stripeConnectAccountId,
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return { url: session.url };
  }

  async processJobPayment(ticketId: string, proposalId: string, sessionId: string, amount: number) {
    const providerId = (await this.prisma.proposal.findUnique({ where: { id: proposalId } }))?.providerId;
    
    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          ticketId,
          proposalId,
          amount: amount / 100,
          status: 'paid',
          stripeSessionId: sessionId,
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          paymentStatus: 'escrow',
          assignedToId: providerId,
          status: 'in_progress',
        },
      }),
      this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'accepted' },
      }),
      // Atualizar saldo em escrow do técnico
      this.prisma.user.update({
        where: { id: providerId! },
        data: {
          escrowBalance: { increment: amount / 100 }
        }
      })
    ]);

    // Notificar técnico
    if (providerId) {
      this.notifications.sendPaymentNotification(providerId, (amount / 100).toFixed(2), ticketId).catch(e => {
        this.logger.error(`Erro ao notificar técnico ${providerId}: ${e.message}`);
      });
    }

    this.logger.log(`Pagamento em Escrow confirmado para o ticket: ${ticketId}`);
  }

  async processSubscription(userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 dias de acesso

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionActive: true,
        subscriptionExpiresAt: expiryDate,
      },
    });

    this.logger.log(`Assinatura ativa para o usuário: ${userId}`);
  }

  async processMpPayment(paymentId: string) {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      this.logger.warn('MP_ACCESS_TOKEN não configurado — webhook MP ignorado');
      return;
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        this.logger.error(`Erro ao buscar pagamento MP ${paymentId}: ${response.status}`);
        return;
      }

      const payment: any = await response.json();

      if (payment.status !== 'approved') {
        this.logger.log(`Pagamento MP ${paymentId} com status: ${payment.status} — ignorado`);
        return;
      }

      const { userId, planId, ticketId, proposalId, type } = payment.metadata || {};

      if (type === 'job_payment' && ticketId && proposalId) {
        const amountCents = Math.round(payment.transaction_amount * 100);
        await this.processJobPayment(ticketId, proposalId, `mp_${paymentId}`, amountCents);
      } else if (userId) {
        await this.processSubscription(userId);
      }

      this.logger.log(`Pagamento MercadoPago ${paymentId} processado com sucesso`);
    } catch (err: any) {
      this.logger.error(`Falha ao processar webhook MP ${paymentId}: ${err.message}`);
    }
  }
}
