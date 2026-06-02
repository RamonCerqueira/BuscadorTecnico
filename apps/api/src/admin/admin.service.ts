import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalTickets, activeSubscriptions, techniciansCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.ticket.count(),
      this.prisma.user.count({ where: { subscriptionActive: true } }),
      this.prisma.user.count({ where: { userType: UserType.technician } })
    ]);

    return {
      totalUsers,
      totalTickets,
      activeSubscriptions,
      techniciansCount,
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        subscriptionActive: true,
        createdAt: true,
        avatarUrl: true
      }
    });
  }

  async toggleSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionActive: !user.subscriptionActive }
    });
  }
}
