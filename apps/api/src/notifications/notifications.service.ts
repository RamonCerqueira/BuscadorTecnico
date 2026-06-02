import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidKeys: { publicKey: string; privateKey: string };

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @InjectQueue('notifications-queue') private readonly notificationsQueue: Queue,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');

    if (publicKey && privateKey) {
      this.vapidKeys = { publicKey, privateKey };
      webpush.setVapidDetails(
        'mailto:suporte@techfix.com.br',
        publicKey,
        privateKey
      );
      this.logger.log('VAPID chaves configuradas com sucesso a partir do .env');
    } else {
      // Auto-generate for transparent development
      this.vapidKeys = webpush.generateVAPIDKeys();
      webpush.setVapidDetails(
        'mailto:suporte@techfix.com.br',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
      this.logger.warn('Chaves VAPID não configuradas. Chaves transientes geradas para desenvolvimento.');
      this.logger.warn(`VAPID_PUBLIC_KEY transiente: ${this.vapidKeys.publicKey}`);
    }
  }

  getVapidKey() {
    return { publicKey: this.vapidKeys.publicKey };
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async subscribe(userId: string, subscription: any) {
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new Error('Assinatura Push inválida');
    }

    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });

    // Enfileira PWA push notification no BullMQ
    await this.notificationsQueue.add('send-push', {
      userId: data.userId,
      payload: {
        title: data.title,
        body: data.message,
        link: data.link,
      },
    }).catch((e) => {
      this.logger.error(`Falha ao enfileirar push notification no BullMQ para o usuário ${data.userId}: ${e.message}`);
    });

    return notification;
  }

  async sendPushNotification(userId: string, payload: { title: string; body: string; link?: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const payloadString = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payloadString
          );
        } catch (error: any) {
          // If subscription is expired or unsubscribed, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            this.logger.log(`Removendo assinatura de push expirada do ID: ${sub.id}`);
            await this.prisma.pushSubscription.delete({
              where: { id: sub.id },
            }).catch(() => {});
          }
        }
      })
    );
  }

  async sendProposalNotification(userId: string, ticketTitle: string, ticketId: string) {
    return this.create({
      userId,
      title: 'Nova Proposta Recebida',
      message: `Você recebeu uma nova proposta para o chamado: "${ticketTitle}".`,
      type: 'proposal',
      link: `/tickets/${ticketId}`,
    });
  }

  async sendPaymentNotification(userId: string, amount: string, ticketId: string) {
    return this.create({
      userId,
      title: 'Pagamento em Escrow',
      message: `O cliente realizou o pagamento de R$ ${amount}. O valor está seguro em escrow e será liberado após a conclusão.`,
      type: 'payment',
      link: `/tickets/${ticketId}`,
    });
  }

  async sendReleaseNotification(userId: string, amount: string, ticketId: string) {
    return this.create({
      userId,
      title: 'Pagamento Liberado!',
      message: `O serviço foi concluído e o valor de R$ ${amount} foi liberado para sua carteira.`,
      type: 'payment',
      link: `/dashboard/technician`,
    });
  }
}
