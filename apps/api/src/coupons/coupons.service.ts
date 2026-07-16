import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCouponDto) {
    const codeFormatted = dto.code.toUpperCase().replace(/\s+/g, '');
    
    // Check if code already exists
    const existing = await this.prisma.coupon.findUnique({
      where: { code: codeFormatted }
    });
    if (existing) {
      throw new ConflictException('Já existe um cupom cadastrado com este código.');
    }

    const expiryDate = dto.expiryDate 
      ? new Date(dto.expiryDate) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    return this.prisma.coupon.create({
      data: {
        code: codeFormatted,
        type: dto.type,
        value: dto.value,
        minOrder: dto.minOrder,
        expiryDate,
        limitUses: dto.limitUses ?? 50,
        userId,
      }
    });
  }

  async findAllForProvider(userId: string) {
    return this.prisma.coupon.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async exploreActive() {
    return this.prisma.coupon.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            name: true,
            userType: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async toggleActive(userId: string, id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id }
    });
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado.');
    }
    if (coupon.userId !== userId) {
      throw new ForbiddenException('Apenas o criador do cupom pode editá-lo.');
    }

    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive }
    });
  }

  async remove(userId: string, id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id }
    });
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado.');
    }
    if (coupon.userId !== userId) {
      throw new ForbiddenException('Apenas o criador do cupom pode excluí-lo.');
    }

    return this.prisma.coupon.delete({
      where: { id }
    });
  }

  async validateCoupon(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });
    if (!coupon || !coupon.isActive) {
      return { valid: false, message: 'Cupom inválido ou inativo.' };
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: 'Cupom expirado.' };
    }
    if (coupon.usedCount >= coupon.limitUses) {
      return { valid: false, message: 'Limite de utilização do cupom atingido.' };
    }
    if (coupon.minOrder && amount < Number(coupon.minOrder)) {
      return { valid: false, message: `Valor mínimo do serviço para este cupom é R$ ${Number(coupon.minOrder).toFixed(2)}.` };
    }

    // calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = amount * (Number(coupon.value) / 100);
    } else {
      discount = Number(coupon.value);
    }

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discount: Math.min(discount, amount),
    };
  }
}
