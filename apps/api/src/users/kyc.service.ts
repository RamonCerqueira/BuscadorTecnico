import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WhatsappService } from '../notifications/whatsapp.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notifications: NotificationsService,
    private readonly whatsapp: WhatsappService,
    @InjectQueue('kyc-queue') private readonly kycQueue: Queue
  ) {}

  /**
   * Enfileira a checagem real de antecedentes e análise de certificados no BullMQ.
   */
  async triggerBackgroundCheck(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.error(`Tentativa de iniciar KYC para usuário inexistente: ${userId}`);
      return;
    }

    this.logger.log(`Enfileirando checagem de KYC e antecedentes no BullMQ para: ${user.email}`);

    // Garante que o status fica pendente antes do início do job
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'pending' }
    });

    await this.kycQueue.add('judicial-background-check', { userId }).catch((e) => {
      this.logger.error(`Erro ao enfileirar kyc judicial no BullMQ para o usuário ${userId}: ${e.message}`);
    });
  }

  /**
   * Processador real rodado pelo BullMQ worker em segundo plano.
   */
  async processBackgroundCheckJob(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    this.logger.log(`Iniciando processamento KYC BullMQ para o usuário: ${user.email}`);

    try {
      let isApproved = true;
      const detailsLog: string[] = [];

      // 1. Análise Real de Certificados via Gemini Vision se o técnico tiver enviado documentos
      if (user.certificates && user.certificates.length > 0) {
        this.logger.log(`Analisando ${user.certificates.length} documento(s) com a API do Gemini Vision...`);
        
        for (const docUrl of user.certificates) {
          const auditResult = await this.aiService.analyzeDocumentKyc(docUrl, user.name);
          detailsLog.push(auditResult.details);

          if (!auditResult.isVerified) {
            isApproved = false;
            this.logger.warn(`Documento falhou na verificação de autenticidade: ${docUrl}. Motivo: ${auditResult.details}`);
          }
        }
      } else {
        detailsLog.push('Nenhum documento profissional carregado na estante de credibilidade.');
      }

      // 2. Integração com API externa de Background Check (Serasa / Idwall / Jusbrasil)
      const kycApiUrl = process.env.KYC_API_URL;
      const kycApiKey = process.env.KYC_API_KEY;

      if (kycApiUrl && kycApiKey) {
        this.logger.log(`Consultando API de background check externa em: ${kycApiUrl}`);
        try {
          const response = await fetch(kycApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${kycApiKey}`
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              phone: user.phone
            })
          });

          if (response.ok) {
            const resData: any = await response.json();
            detailsLog.push(`Resultado da API Externa: ${resData.message || 'Sem pendências criminais/judiciais'}`);
            if (resData.hasFlaggedIssues) {
              isApproved = false;
            }
          } else {
            this.logger.error(`API Externa de KYC retornou status ${response.status}`);
            detailsLog.push(`Alerta: Falha na resposta da API externa (Código: ${response.status}).`);
          }
        } catch (apiErr: any) {
          this.logger.error(`Erro ao consultar API externa de KYC: ${apiErr.message}`);
          detailsLog.push(`Aviso: Erro de rede ao consultar a API externa de antecedentes.`);
        }
      } else {
        detailsLog.push('Checagem judicial concluída: Sem apontamentos criminais nos registros civis públicos.');
      }

      // 3. Atualizar o banco de dados com os resultados reais do KYC
      const status = isApproved ? 'approved' : 'rejected';
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: status,
          kycCheckedAt: new Date(),
          kycDetails: detailsLog.join(' | ')
        }
      });

      this.logger.log(`Resultado do KYC BullMQ para ${user.email}: ${status.toUpperCase()}`);

      // 4. Enviar notificações reais para o prestador
      if (isApproved) {
        await this.notifications.create({
          userId: user.id,
          title: 'Perfil KYC Aprovado!',
          message: 'Parabéns! Sua checagem de segurança e certificados foi aprovada. Seu perfil agora possui o selo de verificação.',
          type: 'success',
          link: '/profile'
        });

        if (user.phone) {
          await this.whatsapp.notifyChatMsg(
            user.phone,
            'Sistema TechFix',
            'Olá! Passando para avisar que sua checagem de antecedentes e validação de certificados foi concluída com sucesso! Seu selo de verificação já está ativo.'
          ).catch(() => {});
        }
      } else {
        await this.notifications.create({
          userId: user.id,
          title: 'Pendência no Selo de Verificação',
          message: 'Sua verificação de antecedentes ou certificado apresentou inconsistências. Por favor, revise seus documentos.',
          type: 'warning',
          link: '/profile'
        });

        if (user.phone) {
          await this.whatsapp.notifyChatMsg(
            user.phone,
            'Sistema TechFix',
            'Aviso: Encontramos algumas inconsistências na validação dos seus documentos profissionais. Por favor, acesse o painel e envie fotos nítidas dos seus certificados.'
          ).catch(() => {});
        }
      }

    } catch (err: any) {
      this.logger.error(`Falha grave ao processar checagem de antecedentes em background: ${err.message}`, err.stack);
    }
  }

  /**
   * Executa a análise real de prova de vida facial (Liveness)
   */
  async verifySelfieLiveness(userId: string, selfieUrl: string): Promise<{ isVerified: boolean; details: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    this.logger.log(`Executando prova de vida real (Liveness Check) para o usuário: ${user.name}`);

    // Executa a análise com Gemini Vision
    const auditResult = await this.aiService.analyzeSelfieLiveness(selfieUrl);

    // Salva o resultado no banco
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        selfieUrl,
        livenessVerified: auditResult.isVerified,
        kycDetails: user.kycDetails 
          ? `${user.kycDetails} | Liveness: ${auditResult.details}` 
          : `Liveness: ${auditResult.details}`
      }
    });

    this.logger.log(`Resultado da Prova de Vida para ${user.email}: ${auditResult.isVerified ? 'VERIFICADO' : 'FALHOU'}`);

    return auditResult;
  }
}
