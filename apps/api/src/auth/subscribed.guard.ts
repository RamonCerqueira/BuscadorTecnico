import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscribedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, method } = request;
    
    // Admins e Clientes não precisam de assinatura para navegar
    if (user.userType === 'admin' || user.userType === 'client') {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { subscriptionActive: true }
    });

    // Se tem assinatura ativa, passa direto
    if (dbUser?.subscriptionActive) {
      return true;
    }

    // Se não for POST (ex: GET para ler, PATCH para atualizar proposta existente), permite
    if (method !== 'POST') {
      return true;
    }

    // Se for POST (criar proposta), verifica o limite do plano free
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const proposalsThisMonth = await this.prisma.proposal.count({
      where: {
        providerId: user.sub,
        createdAt: { gte: startOfMonth }
      }
    });

    if (proposalsThisMonth >= 3) {
      throw new ForbiddenException('Você atingiu o limite do plano grátis (3 orçamentos/mês). Assine o Premium para enviar propostas ilimitadas.');
    }

    return true;
  }
}
