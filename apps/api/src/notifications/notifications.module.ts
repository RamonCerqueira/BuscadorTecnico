import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WhatsappService } from './whatsapp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'notifications-queue',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, WhatsappService, NotificationsProcessor],
  exports: [NotificationsService, WhatsappService],
})
export class NotificationsModule {}
