import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const brl = await prisma.currency.upsert({
    where: { code: 'BRL' },
    update: {},
    create: {
      code: 'BRL',
      name: 'Brazilian Real',
      symbol: 'R$',
      isBase: true,
    },
  });

  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      isBase: false,
    },
  });

  await prisma.exchangeRate.upsert({
    where: {
      currencyId_rateDate: {
        currencyId: usd.id,
        rateDate: new Date('2026-06-26'),
      },
    },
    update: {
      rate: '5.50000000',
      source: 'mocked-provider',
    },
    create: {
      currencyId: usd.id,
      rate: '5.50000000',
      rateDate: new Date('2026-06-26'),
      source: 'mocked-provider',
    },
  });

  await prisma.receivableType.upsert({
    where: { code: 'DUPLICATA_MERCANTIL' },
    update: {},
    create: {
      code: 'DUPLICATA_MERCANTIL',
      name: 'Duplicata Mercantil',
      spreadPercent: '0.015000',
      description: 'Trade invoice receivable with 1.5% monthly spread.',
    },
  });

  await prisma.receivableType.upsert({
    where: { code: 'CHEQUE_PRE_DATADO' },
    update: {},
    create: {
      code: 'CHEQUE_PRE_DATADO',
      name: 'Cheque Pré-datado',
      spreadPercent: '0.025000',
      description: 'Post-dated check receivable with 2.5% monthly spread.',
    },
  });

  await prisma.cedent.upsert({
    where: { document: '12345678000190' },
    update: {},
    create: {
      name: 'Cedente Demonstração LTDA',
      document: '12345678000190',
      email: 'financeiro@cedente-demo.local',
    },
  });

  console.log('Database seed completed successfully.');
  console.log({ brl: brl.code, usd: usd.code });
}

main()
  .catch((error) => {
    console.error('Database seed failed.', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
