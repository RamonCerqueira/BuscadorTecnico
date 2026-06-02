import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';

@Processor('notifications-queue')
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, payload } = job.data;
    
    if (job.name === 'send-push') {
      await this.notificationsService.sendPushNotification(userId, payload);
    }
  }
}
