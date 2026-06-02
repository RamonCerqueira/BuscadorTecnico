import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { title: string; description?: string; beforeUrl: string; afterUrl: string; category?: string }) {
    return this.prisma.portfolioItem.create({
      data: { userId, ...data },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item não encontrado');
    if (item.userId !== userId) throw new ForbiddenException('Sem permissão');
    return this.prisma.portfolioItem.delete({ where: { id } });
  }
}
