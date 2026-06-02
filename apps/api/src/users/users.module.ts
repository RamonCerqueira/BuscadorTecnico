import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { KycService } from './kyc.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';
import { BullModule } from '@nestjs/bullmq';
import { KycProcessor } from './kyc.processor';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    NotificationsModule,
    AiModule,
    BullModule.registerQueue({
      name: 'kyc-queue',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, KycService, KycProcessor],
  exports: [UsersService, KycService],
})
export class UsersModule {}
