import { PrismaClient, UserType, TicketStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('TechFix2026@', 10);

  // 1. Criar Clientes fictícios
  const client1 = await prisma.user.upsert({
    where: { email: 'contato@vitor.com' },
    update: {},
    create: {
      email: 'contato@vitor.com',
      name: 'Vitor Hugo Oliveira',
      passwordHash,
      userType: UserType.client,
      city: 'São Paulo',
      state: 'SP',
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'ana.clara@email.com' },
    update: {},
    create: {
      email: 'ana.clara@email.com',
      name: 'Ana Clara Santos',
      passwordHash,
      userType: UserType.client,
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
  });

  // 2. Criar Técnicos Verificados
  const tech1 = await prisma.user.upsert({
    where: { email: 'roberto.eletrica@techfix.com' },
    update: {},
    create: {
      email: 'roberto.eletrica@techfix.com',
      name: 'Roberto Silva (Eletricista)',
      passwordHash,
      userType: UserType.technician,
      bio: 'Especialista em quadros de força e automação residencial com 15 anos de mercado. Certificado pelo SENAI.',
      specialties: ['Elétrica', 'Automação', 'Manutenção Preventiva'],
      rating: 4.8,
      totalReviews: 142,
      subscriptionActive: true,
    },
  });

  // 3. Criar Chamados (Tickets) Realistas
  const ticketsData = [
    {
      title: 'Reparo Urgente: Quadro de Luz em Curto',
      description: 'Metade da casa está sem luz após um estouro no quadro principal. Preciso de avaliação urgente pois tenho crianças.',
      locationText: 'Jardins, São Paulo - SP',
      latitude: -23.5658,
      longitude: -46.6651,
      clientId: client1.id,
      aiInsights: 'Possível sobrecarga no disjuntor principal. Recomenda-se teste de continuidade e verificação de fiação derretida.',
    },
    {
      title: 'Instalação de Ar Condicionado Multi-Split',
      description: 'Preciso instalar 3 evaporadoras e 1 condensadora. Infraestrutura já está pronta (passagem de cobre).',
      locationText: 'Barra da Tijuca, Rio de Janeiro - RJ',
      latitude: -23.0001,
      longitude: -43.3658,
      clientId: client2.id,
      aiInsights: 'Cálculo de BTUs parece correto para a área informada. Verificar se a fiação atual suporta a carga do Multi-Split.',
    },
    {
      title: 'Vazamento em Tubulação de Banheiro',
      description: 'Infiltração no teto do vizinho de baixo. Provavelmente o vaso sanitário ou ralo do chuveiro.',
      locationText: 'Vila Mariana, São Paulo - SP',
      latitude: -23.5857,
      longitude: -46.6339,
      clientId: client1.id,
      aiInsights: 'Sinais clássicos de falha na vedação do anel do vaso ou ralo linear. Necessário teste de teste de estanqueidade.',
    },
    {
      title: 'Troca de Disjuntores e fiação de chuveiro',
      description: 'Chuveiro está desarmando o disjuntor toda vez que liga no quente. Preciso trocar por um de maior amperagem.',
      locationText: 'Ipanema, Rio de Janeiro - RJ',
      latitude: -22.9839,
      longitude: -43.2023,
      clientId: client2.id,
      aiInsights: 'Aviso: Trocar apenas o disjuntor por um maior sem trocar a fiação pode causar incêndio. Recomenda-se fiação de 6mm ou 10mm.',
    }
  ];

  for (const t of ticketsData) {
    await prisma.ticket.create({ data: t });
  }

  console.log('✅ TechFix Seed: 2 Clientes, 1 Técnico Pro e 4 Chamados BR criados com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
