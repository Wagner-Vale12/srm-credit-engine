import type {
  ApiHealth,
  CreateReceivablePayload,
  Currency,
  PaginatedResponse,
  PricingSimulationPayload,
  Receivable,
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

  receivables() {
    return request<PaginatedResponse<Receivable>>(
      "/receivables?page=1&limit=10",
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
