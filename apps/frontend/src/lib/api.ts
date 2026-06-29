import type {
  ApiHealth,
  CreateReceivablePayload,
  Currency,
  PaginatedResponse,
  PricingSimulationPayload,
  Receivable,
  ReceivableQuery,
  SettlementReportQuery,
  SettlementReportRow,
  SettlementPayload,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

type RequestOptions = RequestInit & {
  body?: BodyInit | null;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function createCorrelationId() {
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toQueryString<T extends object>(query: T) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": createCorrelationId(),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

export const api = {
  health() {
    return request<ApiHealth>("/health");
  },

  currencies() {
    return request<Currency[]>("/currencies");
  },

  listReceivables(query: ReceivableQuery = {}) {
    return request<PaginatedResponse<Receivable>>(
      `/receivables${toQueryString(query)}`,
    );
  },

  receivables() {
    return this.listReceivables({ page: 1, limit: 10 });
  },

  getSettlementReportList(query: SettlementReportQuery = {}) {
    return request<PaginatedResponse<SettlementReportRow>>(
      `/settlement-reports${toQueryString(query)}`,
    );
  },

  createReceivable(payload: CreateReceivablePayload) {
    return request<Receivable>("/receivables", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  simulatePricing(payload: PricingSimulationPayload) {
    return request<unknown>("/pricing/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createSettlement(payload: SettlementPayload) {
    return request<unknown>("/settlements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  settlementReport(settlementId: string) {
    return request<unknown>(`/settlements/${settlementId}/report`);
  },
};
