export type CreateSettlementInput = {
  receivableId: string;
  paymentCurrencyCode: string;
  baseRateMonthly: string;
  settlementDate?: string;
  userId?: string;
};

export type SettlementSummary = {
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
  baseRateMonthly: string;
  spreadMonthly: string;
  effectiveMonthlyRate: string;
  exchangeRate: string | null;
  status: string;
  settlementDate: string;
};

export type SettlementReport = {
  settlementId: string;
  status: string;
  settlementDate: string;
  cedent: {
    id: string;
    name: string;
    document: string;
  };
  receivable: {
    id: string;
    type: string;
    currency: string;
    faceValue: string;
    dueDate: string;
  };
  pricing: {
    presentValue: string;
    discountAmount: string;
    baseRateMonthly: string;
    spreadMonthly: string;
    effectiveMonthlyRate: string;
  };
  payment: {
    currency: string;
    amount: string;
    exchangeRate: string | null;
  };
};

export type ListSettlementsInput = {
  page?: number;
  limit?: number;
  status?: string;
  currencyCode?: string;
  receivableTypeCode?: string;
  cedentId?: string;
  settlementDateFrom?: string;
  settlementDateTo?: string;
};

export type PaginatedSettlements = {
  data: SettlementSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
