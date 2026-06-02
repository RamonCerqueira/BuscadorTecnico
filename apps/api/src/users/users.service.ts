import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        specialties: true,
        certificates: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
        rating: true,
        totalReviews: true,
        balance: true,
        escrowBalance: true,
        // KYC & Liveness
        kycStatus: true,
        kycDetails: true,
        kycCheckedAt: true,
        livenessVerified: true,
        selfieUrl: true,
        // LGPD
        acceptedTermsAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findAllProfessionals(category?: string, cursor?: string, limit = 20) {
    const cacheKey = `users:list:${category || 'all'}:${cursor || 'start'}:${limit}`;
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      console.error('Erro ao ler cache Redis:', e);
    }

    const items = await this.prisma.user.findMany({
      take: limit + 1,
      where: {
        userType: { in: ['technician', 'company'] },
        ...(category ? { specialties: { has: category } } : {})
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        specialties: true,
        rating: true,
        totalReviews: true,
        city: true,
        state: true,
        bio: true,
        kycStatus: true,
        livenessVerified: true
      },
      orderBy: { rating: 'desc' }
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    const result = {
      data: items,
      nextCursor
    };

    try {
      await this.cacheManager.set(cacheKey, result, 60000); // 60s cache
    } catch (e) {
      console.error('Erro ao gravar cache Redis:', e);
    }

    return result;
  }

  async findNearbyTechnicians(lat: number, lng: number, radiusKm: number = 20) {
    // Usamos queryRaw para cálculo matemático de distância (Haversine)
    const technicians = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, "avatarUrl", specialties, rating, "totalReviews", city, state, "kycStatus", "livenessVerified",
             (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
      FROM "User"
      WHERE ("userType" = 'technician' OR "userType" = 'company')
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      GROUP BY id
      HAVING (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) <= ${radiusKm}
      ORDER BY distance ASC
    `;

    return technicians;
  }

  async getComplianceLogs() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        acceptedTermsAt: true,
        signupIpAddress: true,
        signupUserAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTechnicianStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        escrowBalance: true,
        rating: true,
        totalReviews: true
      }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const totalJobs = await this.prisma.ticket.count({
      where: {
        assignedToId: userId,
        status: { in: ['resolved', 'closed'] }
      }
    });

    const pendingProposals = await this.prisma.proposal.count({
      where: {
        providerId: userId,
        status: 'pending'
      }
    });

    const completedPayments = await this.prisma.payment.findMany({
      where: {
        ticket: { assignedToId: userId, status: { in: ['resolved', 'closed'] } },
        status: 'released'
      },
      select: { amount: true }
    });
    
    const totalEarned = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      balance: Number(user.balance),
      escrowBalance: Number(user.escrowBalance),
      rating: user.rating,
      totalReviews: user.totalReviews,
      totalJobs,
      pendingProposals,
      totalEarned,
      platformFee: totalEarned * 0.15,
      netEarnings: totalEarned * 0.85
    };
  }
}
