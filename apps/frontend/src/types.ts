export type ApiHealth = {
  status?: string;
  timestamp?: string;
  uptime?: number;
  [key: string]: unknown;
};

export type Currency = {
  id?: string;
  code: string;
  name?: string;
  symbol?: string;
  [key: string]: unknown;
};

export type ReceivableStatus = "OPEN" | "SETTLED" | "CANCELLED" | string;

export type Receivable = {
  id: string;
  cedentId?: string;
  cedentName?: string;
  receivableTypeCode?: string;
  receivableType?: string;
  currencyCode: string;
  faceValue: string;
  dueDate: string;
  status: ReceivableStatus;
  createdAt?: string;
  [key: string]: unknown;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
};

export type ReceivableQuery = {
  page?: number;
  limit?: number;
  status?: string;
  currencyCode?: string;
  receivableTypeCode?: string;
  cedentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
};

export type SettlementReportQuery = {
  page?: number;
  limit?: number;
  cedentId?: string;
  currencyCode?: string;
  receivableTypeCode?: string;
  settlementDateFrom?: string;
  settlementDateTo?: string;
};

export type SettlementReportRow = {
  settlementId: string;
  receivableId: string;
  cedentName: string;
  receivableType: string;
  receivableCurrency: string;
  paymentCurrency: string;
  faceValue: string;
  presentValue: string;
  paymentAmount: string;
  discountAmount: string;
  status: string;
  settlementDate: string;
};

export type CreateReceivablePayload = {
  cedentId: string;
  receivableTypeCode: string;
  currencyCode: string;
  faceValue: string;
  dueDate: string;
};

export type PricingSimulationPayload = {
  receivableType: string;
  currencyCode: string;
  faceValue: string;
  baseRateMonthly: string;
  dueDate: string;
  simulationDate?: string;
};

export type SettlementPayload = {
  receivableId: string;
  paymentCurrencyCode: string;
  baseRateMonthly: string;
  settlementDate?: string;
  userId?: string;
};

export type ApiErrorResponse = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  path?: string;
  method?: string;
  correlationId?: string;
  timestamp?: string;
};
