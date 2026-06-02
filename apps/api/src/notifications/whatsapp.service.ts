import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private config: ConfigService) {}

  async sendTemplate(to: string, templateName: string, vars: Record<string, string>) {
     // Aqui integrariamos com Evolution API ou Twilio
     // Ex: const url = this.config.get('WHATSAPP_API_URL');
     
     this.logger.log(`[WHATSAPP] Enviando template "${templateName}" para ${to} com variáveis: ${JSON.stringify(vars)}`);
     
     // Simulação de delay de rede
     return new Promise(resolve => setTimeout(resolve, 500));
  }

  async notifyNewProposal(clientPhone: string, clientName: string, ticketTitle: string, providerName: string) {
    return this.sendTemplate(clientPhone, 'new_proposal', {
      name: clientName,
      ticket: ticketTitle,
      provider: providerName
    });
  }

  async notifyChatMsg(toPhone: string, fromName: string, message: string) {
    return this.sendTemplate(toPhone, 'new_message', {
       from: fromName,
       text: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });
  }
}
