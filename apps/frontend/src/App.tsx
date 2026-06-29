import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ApiError, api } from "./lib/api";
import type {
  ApiHealth,
  CreateReceivablePayload,
  Currency,
  PricingSimulationPayload,
  Receivable,
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
      const [healthResponse, currenciesResponse, receivablesResponse] =
        await Promise.all([api.health(), api.currencies(), api.receivables()]);

      setHealth(healthResponse);
      setCurrencies(currenciesResponse);
      setReceivables(receivablesResponse.data);

      if (receivablesResponse.data[0]?.id) {
        setSelectedReceivableId(receivablesResponse.data[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
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

      const receivablesResponse = await api.receivables();
      setReceivables(receivablesResponse.data);
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

      const receivablesResponse = await api.receivables();
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
      setError("Informe o settlementId para buscar o relatório.");
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

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">SRM Credit Engine</p>
          <h1>Frontend MVP</h1>
          <p>
            Demonstração ponta a ponta para criação, precificação e liquidação
            de recebíveis multimoedas.
          </p>
        </div>

        <button type="button" onClick={loadInitialData} disabled={loading}>
          {loading ? "Carregando..." : "Recarregar dados"}
        </button>
      </section>

      {error && (
        <section className="error-card">
          <strong>Erro na API</strong>
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
                placeholder="Cole aqui o ID do cedente seedado"
              />
            </label>

            <label>
              Tipo
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
                <option value="CHEQUE_PRE_DATADO">Cheque Pré-datado</option>
              </select>
            </label>

            <label>
              Moeda
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
              Valor de face
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
              Data de vencimento
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
              ? "Criando..."
              : createdReceivable
                ? "Recebível criado"
                : "Criar recebível"}
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
              Criar outro recebível
            </button>
          )}

          {createdReceivable && (
            <div className="result">
              <h3>Recebível criado</h3>
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
            <span className="badge">{receivables.length} registros</span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Moeda</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {receivables.map((receivable) => {
                  const isSelected = selectedReceivableId === receivable.id;

                  return (
                    <tr
                      key={receivable.id}
                      className={isSelected ? "selected-row" : undefined}
                    >
                      <td title={receivable.id}>
                        {receivable.id.slice(0, 8)}...
                      </td>

                      <td>
                        {receivable.receivableTypeCode ??
                          receivable.receivableType ??
                          "-"}
                      </td>

                      <td>{receivable.currencyCode}</td>

                      <td>{receivable.faceValue}</td>

                      <td>{receivable.dueDate}</td>

                      <td>
                        <span className="badge">{receivable.status}</span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            isSelected ? "secondary selected" : "secondary"
                          }
                          onClick={() => setSelectedReceivableId(receivable.id)}
                        >
                          {isSelected ? "Selecionado" : "Selecionar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            A simulação usa os mesmos dados do formulário de criação do
            recebível, com taxa base mensal de 1.00%.
          </p>

          <pre>{formatJson(pricingPayload)}</pre>

          <button
            type="button"
            onClick={handlePricingSimulation}
            disabled={loading || !selectedReceivableId}
          >
            {loading ? "Simulando..." : "Simular pricing"}
          </button>

          {pricingResult ? (
            <div className="result">
              <h3>Resultado da simulação</h3>
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
            Receivable ID selecionado
            <input
              value={selectedReceivableId}
              onChange={(event) => setSelectedReceivableId(event.target.value)}
              placeholder="Selecione ou cole o ID do recebível"
            />
          </label>

          <button
            type="button"
            onClick={handleCreateSettlement}
            disabled={loading || !selectedReceivableId}
          >
            {loading ? "Liquidando..." : "Liquidar recebível"}
          </button>

          {settlementResult ? (
            <div className="result">
              <h3>Settlement criado</h3>
              <pre>{formatJson(settlementResult)}</pre>
            </div>
          ) : null}

          <div className="divider" />

          <label>
            Settlement ID
            <input
              value={settlementId}
              onChange={(event) => setSettlementId(event.target.value)}
              placeholder="Cole o ID da liquidação"
            />
          </label>

          <button
            type="button"
            onClick={handleLoadSettlementReport}
            disabled={loading || !settlementId}
          >
            Buscar relatório
          </button>

          {settlementReport ? (
            <div className="result">
              <h3>Relatório de liquidação</h3>
              <pre>{formatJson(settlementReport)}</pre>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}

export default App;
