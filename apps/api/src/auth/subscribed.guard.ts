import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscribedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    
    // Admins e Clientes não precisam de assinatura para navegar
    if (user.userType === 'admin' || user.userType === 'client') {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { subscriptionActive: true }
    });

    if (!dbUser?.subscriptionActive) {
      throw new ForbiddenException('Sua assinatura está inativa. Regularize o pagamento para acessar o Marketplace.');
    }

    return true;
  }
}
