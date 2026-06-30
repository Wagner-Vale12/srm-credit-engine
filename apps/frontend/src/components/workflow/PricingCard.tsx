import type { PricingSimulationPayload } from "../../types";
import { CardHeader } from "../common/CardHeader";
import { JsonViewer } from "../common/JsonViewer";

type PricingCardProps = {
  payload: PricingSimulationPayload;
  result?: unknown;
  loading: boolean;
  hasSelection: boolean;
  onSimulate: () => void;
};

export function PricingCard({
  payload,
  result,
  loading,
  hasSelection,
  onSimulate,
}: PricingCardProps) {
  return (
    <article className="card">
      <CardHeader step="05" title="Pricing Simulation" />
      <p className="muted">
        The simulation uses the selected receivable data with a 1.00% monthly
        base rate.
      </p>
      <JsonViewer value={payload} />
      <button
        type="button"
        onClick={onSimulate}
        disabled={loading || !hasSelection}
      >
        {loading ? "Simulating..." : "Simulate pricing"}
      </button>
      {result ? (
        <div className="result">
          <h3>Simulation result</h3>
          <JsonViewer value={result} />
        </div>
      ) : null}
    </article>
  );
}
