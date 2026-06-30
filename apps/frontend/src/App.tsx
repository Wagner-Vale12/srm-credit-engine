import "./App.css";
import { ErrorAlert } from "./components/common/ErrorAlert";
import { AppHeader } from "./components/layout/AppHeader";
import { CreateReceivableSection } from "./components/receivables/CreateReceivableSection";
import { ReceivablesTable } from "./components/receivables/ReceivablesTable";
import { CurrenciesCard } from "./components/status/CurrenciesCard";
import { HealthCard } from "./components/status/HealthCard";
import { PricingCard } from "./components/workflow/PricingCard";
import { SettlementCard } from "./components/workflow/SettlementCard";
import { useCreditEngine } from "./hooks/useCreditEngine";

function App() {
  const engine = useCreditEngine();

  return (
    <main className="app">
      <AppHeader loading={engine.loading} onReload={engine.loadInitialData} />
      <ErrorAlert message={engine.error} />

      <section className="grid two-columns">
        <HealthCard health={engine.health} />
        <CurrenciesCard currencies={engine.currencies} />
      </section>

      <CreateReceivableSection
        form={engine.receivableForm}
        createdReceivable={engine.createdReceivable}
        loading={engine.loading}
        onFormChange={engine.setReceivableForm}
        onCreate={engine.createReceivable}
        onReset={engine.resetReceivableCreation}
      />

      <ReceivablesTable
        receivables={engine.receivables}
        selectedId={engine.selectedReceivableId}
        onSelect={engine.setSelectedReceivableId}
      />

      <section className="grid two-columns">
        <PricingCard
          payload={engine.pricingPayload}
          result={engine.selectedWorkflow.pricingResult}
          loading={engine.loading}
          hasSelection={Boolean(engine.selectedReceivableId)}
          onSimulate={engine.simulatePricing}
        />
        <SettlementCard
          receivableId={engine.selectedReceivableId}
          settlementId={engine.selectedWorkflow.settlementId ?? ""}
          result={engine.selectedWorkflow.settlementResult}
          report={engine.selectedWorkflow.settlementReport}
          loading={engine.loading}
          onReceivableIdChange={engine.setSelectedReceivableId}
          onSettlementIdChange={engine.setSettlementId}
          onCreate={engine.createSettlement}
          onLoadReport={engine.loadSettlementReport}
        />
      </section>
    </main>
  );
}

export default App;
