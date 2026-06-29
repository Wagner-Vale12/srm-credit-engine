import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ApiError, api } from "./lib/api";
import { Pagination } from "./components/Pagination";
import { ReceivableFilters } from "./components/ReceivableFilters";
import { ReceivablesTable } from "./components/ReceivablesTable";
import type {
  ApiHealth,
  CreateReceivablePayload,
  Currency,
  PricingSimulationPayload,
  Receivable,
  ReceivableQuery,
} from "./types";

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function extractId(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const data = value as Record<string, unknown>;

  if (typeof data.id === "string") return data.id;

  if (typeof data.settlementId === "string") return data.settlementId;

  if (data.settlement && typeof data.settlement === "object") {
    const settlement = data.settlement as Record<string, unknown>;

    if (typeof settlement.id === "string") return settlement.id;

    if (typeof settlement.settlementId === "string") {
      return settlement.settlementId;
    }
  }

  return "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return formatJson(error.payload);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [receivableQuery, setReceivableQuery] = useState<ReceivableQuery>({ page: 1, limit: 10 });
  const [receivableMeta, setReceivableMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createdReceivable, setCreatedReceivable] = useState<Receivable | null>(
    null,
  );
  const [pricingResult, setPricingResult] = useState<unknown>(null);
  const [settlementResult, setSettlementResult] = useState<unknown>(null);
  const [settlementReport, setSettlementReport] = useState<unknown>(null);

  const [settlementId, setSettlementId] = useState("");
  const [selectedReceivableId, setSelectedReceivableId] = useState("");

  const [receivableForm, setReceivableForm] = useState<CreateReceivablePayload>(
    {
      cedentId: "",
      receivableTypeCode: "DUPLICATA_MERCANTIL",
      currencyCode: "BRL",
      faceValue: "10000.00",
      dueDate: "2026-12-31",
    },
  );
  const pricingPayload: PricingSimulationPayload = useMemo(
    () => ({
      receivableType: receivableForm.receivableTypeCode,
      currencyCode: receivableForm.currencyCode,
      faceValue: receivableForm.faceValue,
      baseRateMonthly: "1.00",
      dueDate: receivableForm.dueDate,
    }),
    [receivableForm],
  );

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const [healthResponse, currenciesResponse] =
        await Promise.all([api.health(), api.currencies()]);

      setHealth(healthResponse);
      setCurrencies(currenciesResponse);
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  async function loadReceivables(query: ReceivableQuery) {
    try {
      const response = await api.listReceivables(query);
      setReceivables(response.data);
      setReceivableMeta({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total ?? 0,
        totalPages: response.meta.totalPages ?? 0,
      });
      if (!selectedReceivableId && response.data[0]?.id) setSelectedReceivableId(response.data[0].id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCreateReceivable() {
    setLoading(true);
    setError("");
    setCreatedReceivable(null);

    try {
      const response = await api.createReceivable({
        cedentId: receivableForm.cedentId,
        receivableTypeCode: receivableForm.receivableTypeCode,
        currencyCode: receivableForm.currencyCode,
        faceValue: receivableForm.faceValue,
        dueDate: receivableForm.dueDate,
      });

      setCreatedReceivable(response);
      setSelectedReceivableId(response.id);

      const receivablesResponse = await api.listReceivables(receivableQuery);
      setReceivables(receivablesResponse.data);
      setReceivableMeta({
        page: receivablesResponse.meta.page,
        limit: receivablesResponse.meta.limit,
        total: receivablesResponse.meta.total ?? 0,
        totalPages: receivablesResponse.meta.totalPages ?? 0,
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePricingSimulation() {
    setLoading(true);
    setError("");
    setPricingResult(null);

    try {
      const response = await api.simulatePricing(pricingPayload);
      setPricingResult(response);
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSettlement() {
    setLoading(true);
    setError("");
    setSettlementResult(null);
    setSettlementReport(null);

    try {
      const response = await api.createSettlement({
        receivableId: selectedReceivableId,
        paymentCurrencyCode: receivableForm.currencyCode,
        baseRateMonthly: "1.00",
        userId: "frontend-mvp",
      });
      setSettlementResult(response);

      const id = extractId(response);
      if (id) {
        setSettlementId(id);
      }

      const receivablesResponse = await api.listReceivables(receivableQuery);
      setReceivables(receivablesResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSettlementReport() {
    if (!settlementId) {
      setError("Enter the settlement ID to load the report.");
      return;
    }

    setLoading(true);
    setError("");
    setSettlementReport(null);

    try {
      const response = await api.settlementReport(settlementId);
      setSettlementReport(response);
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    void loadReceivables(receivableQuery);
  }, [receivableQuery]);

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">SRM Credit Engine</p>
          <h1>Frontend MVP</h1>
          <p>
            End-to-end demonstration for creation, pricing, and settlement of
            multi-currency receivables.
          </p>
        </div>

        <button type="button" onClick={loadInitialData} disabled={loading}>
          {loading ? "Loading..." : "Reload data"}
        </button>
      </section>

      {error && (
        <section className="error-card">
          <strong>API error</strong>
          <pre>{error}</pre>
        </section>
      )}

      <section className="grid two-columns">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">01</span>
              <h2>API Health</h2>
            </div>
            <span className={health ? "badge success" : "badge"}>
              {health ? "online" : "offline"}
            </span>
          </div>

          <pre>{formatJson(health)}</pre>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">02</span>
              <h2>Currencies</h2>
            </div>
            <span className="badge">{currencies.length} moedas</span>
          </div>

          <div className="currency-list">
            {currencies.map((currency) => (
              <div key={currency.code} className="currency-item">
                <strong>{currency.code}</strong>
                <span>{currency.name ?? "Currency"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">03</span>
              <h2>Create Receivable</h2>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Cedent ID
              <input
                value={receivableForm.cedentId}
                onChange={(event) =>
                  setReceivableForm((current) => ({
                    ...current,
                    cedentId: event.target.value,
                  }))
                }
                placeholder="Paste the seeded cedent ID"
              />
            </label>

            <label>
              Type
              <select
                value={receivableForm.receivableTypeCode}
                onChange={(event) =>
                  setReceivableForm((current) => ({
                    ...current,
                    receivableTypeCode: event.target.value,
                  }))
                }
              >
                <option value="DUPLICATA_MERCANTIL">Duplicata Mercantil</option>
                <option value="CHEQUE_PRE_DATADO">Post-dated Check</option>
              </select>
            </label>

            <label>
              Currency
              <select
                value={receivableForm.currencyCode}
                onChange={(event) =>
                  setReceivableForm((current) => ({
                    ...current,
                    currencyCode: event.target.value,
                  }))
                }
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <label>
              Face value
              <input
                value={receivableForm.faceValue}
                onChange={(event) =>
                  setReceivableForm((current) => ({
                    ...current,
                    faceValue: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Due date
              <input
                type="date"
                value={receivableForm.dueDate}
                onChange={(event) =>
                  setReceivableForm((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleCreateReceivable}
            disabled={
              loading || !receivableForm.cedentId || !!createdReceivable
            }
          >
            {loading
              ? "Creating..."
              : createdReceivable
                ? "Receivable created"
                : "Create receivable"}
          </button>
          {createdReceivable && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setCreatedReceivable(null);
                setSettlementResult(null);
                setSettlementReport(null);
                setSettlementId("");
              }}
            >
              Create another receivable
            </button>
          )}

          {createdReceivable && (
            <div className="result">
              <h3>Receivable created</h3>
              <pre>{formatJson(createdReceivable)}</pre>
            </div>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">04</span>
              <h2>Receivables List</h2>
            </div>
            <span className="badge">{receivableMeta.total} records</span>
          </div>
          <ReceivableFilters value={receivableQuery} onChange={setReceivableQuery} />
          <ReceivablesTable items={receivables} selectedId={selectedReceivableId} onSelect={setSelectedReceivableId} />
          <Pagination page={receivableMeta.page} totalPages={receivableMeta.totalPages} limit={receivableMeta.limit} onPageChange={(page) => setReceivableQuery((current) => ({ ...current, page }))} onLimitChange={(limit) => setReceivableQuery((current) => ({ ...current, page: 1, limit }))} />
        </article>
      </section>

      <section className="grid two-columns">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">05</span>
              <h2>Pricing Simulation</h2>
            </div>
          </div>

          <p className="muted">
            The simulation uses the same data as the receivable creation form,
            with a 1.00% monthly base rate.
          </p>

          <pre>{formatJson(pricingPayload)}</pre>

          <button
            type="button"
            onClick={handlePricingSimulation}
            disabled={loading || !selectedReceivableId}
          >
            {loading ? "Simulating..." : "Simulate pricing"}
          </button>

          {pricingResult ? (
            <div className="result">
              <h3>Simulation result</h3>
              <pre>{formatJson(pricingResult)}</pre>
            </div>
          ) : null}
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <span className="step">06</span>
              <h2>Settlement</h2>
            </div>
          </div>

          <label>
            Selected receivable ID
            <input
              value={selectedReceivableId}
              onChange={(event) => setSelectedReceivableId(event.target.value)}
              placeholder="Select or paste the receivable ID"
            />
          </label>

          <button
            type="button"
            onClick={handleCreateSettlement}
            disabled={loading || !selectedReceivableId}
          >
            {loading ? "Creating settlement..." : "Create settlement"}
          </button>

          {settlementResult ? (
            <div className="result">
              <h3>Settlement created</h3>
              <pre>{formatJson(settlementResult)}</pre>
            </div>
          ) : null}

          <div className="divider" />

          <label>
            Settlement ID
            <input
              value={settlementId}
              onChange={(event) => setSettlementId(event.target.value)}
              placeholder="Paste the settlement ID"
            />
          </label>

          <button
            type="button"
            onClick={handleLoadSettlementReport}
            disabled={loading || !settlementId}
          >
            Load report
          </button>

          {settlementReport ? (
            <div className="result">
              <h3>Settlement report</h3>
              <pre>{formatJson(settlementReport)}</pre>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}

export default App;
