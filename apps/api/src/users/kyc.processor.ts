import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { KycService } from './kyc.service';

@Processor('kyc-queue')
export class KycProcessor extends WorkerHost {
  constructor(private readonly kycService: KycService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId } = job.data;
    
    if (job.name === 'judicial-background-check') {
      await this.kycService.processBackgroundCheckJob(userId);
    }
  }
}
