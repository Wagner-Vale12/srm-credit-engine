import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/database/prisma.service';
import { GlobalExceptionFilter } from './../src/shared/filters/global-exception.filter';

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().split('T')[0];
}

function extractId(body: any): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.id ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.settlementId ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.receivableId ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.data?.id ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.data?.settlementId ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.data?.receivableId ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.receivable?.id ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    body?.settlement?.id
  );
}

describe('SRM Credit Engine API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cedentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();

    prisma = app.get(PrismaService);

    await prisma.currency.upsert({
      where: { code: 'BRL' },
      update: {},
      create: {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        isBase: true,
      },
    });

    await prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        isBase: false,
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

    const cedent = await prisma.cedent.upsert({
      where: { document: '12345678000190' },
      update: {},
      create: {
        name: 'Cedente Demonstração LTDA',
        document: '12345678000190',
        email: 'financeiro@cedente-demo.local',
      },
    });

    cedentId = cedent.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return 200', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });

  it('should execute the complete financial flow', async () => {
    const dueDate = addDays(45);
    const today = addDays(0);

    const currenciesResponse = await request(app.getHttpServer())
      .get('/api/v1/currencies')
      .expect(200);

    expect(currenciesResponse.body).toBeDefined();

    const createReceivableResponse = await request(app.getHttpServer())
      .post('/api/v1/receivables')
      .set('x-correlation-id', 'e2e-financial-flow')
      .send({
        cedentId,
        receivableTypeCode: 'DUPLICATA_MERCANTIL',
        currencyCode: 'BRL',
        faceValue: '10000.00',
        dueDate,
      });

    expect([200, 201]).toContain(createReceivableResponse.status);

    const receivableId = extractId(createReceivableResponse.body);

    expect(receivableId).toBeDefined();

    const pricingResponse = await request(app.getHttpServer())
      .post('/api/v1/pricing/simulate')
      .set('x-correlation-id', 'e2e-financial-flow')
      .send({
        faceValue: '10000.00',
        currencyCode: 'BRL',
        receivableType: 'DUPLICATA_MERCANTIL',
        baseRateMonthly: '1.00',
        dueDate,
        simulationDate: today,
      });

    expect([200, 201]).toContain(pricingResponse.status);
    expect(pricingResponse.body).toBeDefined();

    const settlementResponse = await request(app.getHttpServer())
      .post('/api/v1/settlements')
      .set('x-correlation-id', 'e2e-financial-flow')
      .send({
        receivableId,
        paymentCurrencyCode: 'BRL',
        baseRateMonthly: '1.00',
        settlementDate: today,
        userId: 'e2e-test',
      });

    expect([200, 201]).toContain(settlementResponse.status);

    const settlementId = extractId(settlementResponse.body);

    expect(settlementId).toBeDefined();

    const reportResponse = await request(app.getHttpServer())
      .get(`/api/v1/settlements/${settlementId}/report`)
      .set('x-correlation-id', 'e2e-financial-flow')
      .expect(200);

    expect(reportResponse.body).toBeDefined();
  });
  it('GET /api/v1/not-found should return standardized 404 error', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/not-found')
      .set('x-correlation-id', 'e2e-not-found')
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      path: '/api/v1/not-found',
      method: 'GET',
      correlationId: 'e2e-not-found',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.timestamp).toBeDefined();
  });

  it('POST /api/v1/receivables should return standardized 400 validation error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/receivables')
      .set('x-correlation-id', 'e2e-validation-error')
      .send({})
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      path: '/api/v1/receivables',
      method: 'POST',
      correlationId: 'e2e-validation-error',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(Array.isArray(response.body.message)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.timestamp).toBeDefined();
  });
});
