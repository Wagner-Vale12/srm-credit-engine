import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type {
  ApiHealth,
  CreateReceivablePayload,
  Currency,
  PricingSimulationPayload,
  Receivable,
} from "../types";
import { getErrorMessage } from "../utils/apiError";
import { extractSettlementId } from "../utils/settlement";

type ReceivableWorkflow = {
  pricingResult?: unknown;
  settlementResult?: unknown;
  settlementReport?: unknown;
  settlementId?: string;
};

const initialReceivableForm: CreateReceivablePayload = {
  cedentId: "",
  receivableTypeCode: "DUPLICATA_MERCANTIL",
  currencyCode: "BRL",
  faceValue: "10000.00",
  dueDate: "2026-12-31",
};

export function useCreditEngine() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdReceivable, setCreatedReceivable] =
    useState<Receivable | null>(null);
  const [selectedReceivableId, setSelectedReceivableId] = useState("");
  const [workflowByReceivable, setWorkflowByReceivable] = useState<
    Record<string, ReceivableWorkflow>
  >({});
  const [receivableForm, setReceivableForm] =
    useState<CreateReceivablePayload>(initialReceivableForm);

  const selectedReceivable = receivables.find(
    (receivable) => receivable.id === selectedReceivableId,
  );
  const selectedWorkflow = selectedReceivableId
    ? (workflowByReceivable[selectedReceivableId] ?? {})
    : {};

  const pricingPayload: PricingSimulationPayload = useMemo(
    () => ({
      receivableType:
        selectedReceivable?.receivableTypeCode ??
        selectedReceivable?.receivableType ??
        receivableForm.receivableTypeCode,
      currencyCode:
        selectedReceivable?.currencyCode ?? receivableForm.currencyCode,
      faceValue: selectedReceivable?.faceValue ?? receivableForm.faceValue,
      baseRateMonthly: "1.00",
      dueDate: selectedReceivable?.dueDate ?? receivableForm.dueDate,
    }),
    [receivableForm, selectedReceivable],
  );

  const updateWorkflow = useCallback(
    (receivableId: string, update: Partial<ReceivableWorkflow>) => {
      if (!receivableId) return;
      setWorkflowByReceivable((current) => ({
        ...current,
        [receivableId]: { ...current[receivableId], ...update },
      }));
    },
    [],
  );

  const handleError = useCallback((cause: unknown) => {
    setError(getErrorMessage(cause));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refreshReceivables = useCallback(async () => {
    const response = await api.receivables();
    setReceivables(response.data);
    return response.data;
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [healthResponse, currenciesResponse, receivablesResponse] =
        await Promise.all([api.health(), api.currencies(), api.receivables()]);
      setHealth(healthResponse);
      setCurrencies(currenciesResponse);
      setReceivables(receivablesResponse.data);
      setSelectedReceivableId((current) =>
        current || receivablesResponse.data[0]?.id || "",
      );
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  async function createReceivable() {
    setLoading(true);
    setError("");
    setCreatedReceivable(null);
    try {
      const response = await api.createReceivable(receivableForm);
      setCreatedReceivable(response);
      setSelectedReceivableId(response.id);
      await refreshReceivables();
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }

  async function simulatePricing() {
    const receivableId = selectedReceivableId;
    setLoading(true);
    setError("");
    updateWorkflow(receivableId, { pricingResult: undefined });
    try {
      const response = await api.simulatePricing(pricingPayload);
      updateWorkflow(receivableId, { pricingResult: response });
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }

  async function createSettlement() {
    const receivableId = selectedReceivableId;
    setLoading(true);
    setError("");
    updateWorkflow(receivableId, {
      settlementResult: undefined,
      settlementReport: undefined,
      settlementId: undefined,
    });
    try {
      const response = await api.createSettlement({
        receivableId,
        paymentCurrencyCode: pricingPayload.currencyCode,
        baseRateMonthly: "1.00",
        userId: "frontend-mvp",
      });
      updateWorkflow(receivableId, {
        settlementResult: response,
        settlementId: extractSettlementId(response) || undefined,
      });
      await refreshReceivables();
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }

  async function loadSettlementReport() {
    const receivableId = selectedReceivableId;
    const settlementId = selectedWorkflow.settlementId;
    if (!settlementId) {
      setError("Enter the settlement ID to load the report.");
      return;
    }
    setLoading(true);
    setError("");
    updateWorkflow(receivableId, { settlementReport: undefined });
    try {
      const response = await api.settlementReport(settlementId);
      updateWorkflow(receivableId, { settlementReport: response });
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }

  function resetReceivableCreation() {
    setCreatedReceivable(null);
    updateWorkflow(selectedReceivableId, {
      settlementResult: undefined,
      settlementReport: undefined,
      settlementId: undefined,
    });
  }

  function setSettlementId(settlementId: string) {
    updateWorkflow(selectedReceivableId, {
      settlementId,
      settlementReport: undefined,
    });
  }

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  return {
    health,
    currencies,
    receivables,
    loading,
    error,
    createdReceivable,
    selectedReceivableId,
    selectedWorkflow,
    receivableForm,
    pricingPayload,
    setSelectedReceivableId,
    setReceivableForm,
    setSettlementId,
    loadInitialData,
    createReceivable,
    resetReceivableCreation,
    simulatePricing,
    createSettlement,
    loadSettlementReport,
  };
}
