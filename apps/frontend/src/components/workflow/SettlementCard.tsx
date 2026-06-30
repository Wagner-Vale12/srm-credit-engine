import { CardHeader } from "../common/CardHeader";
import { JsonViewer } from "../common/JsonViewer";

type SettlementCardProps = {
  receivableId: string;
  settlementId: string;
  result?: unknown;
  report?: unknown;
  loading: boolean;
  onReceivableIdChange: (id: string) => void;
  onSettlementIdChange: (id: string) => void;
  onCreate: () => void;
  onLoadReport: () => void;
};

export function SettlementCard({
  receivableId,
  settlementId,
  result,
  report,
  loading,
  onReceivableIdChange,
  onSettlementIdChange,
  onCreate,
  onLoadReport,
}: SettlementCardProps) {
  return (
    <article className="card">
      <CardHeader step="06" title="Settlement" />
      <label>
        Selected receivable ID
        <input
          value={receivableId}
          onChange={(event) => onReceivableIdChange(event.target.value)}
          placeholder="Select or paste the receivable ID"
        />
      </label>
      <button
        type="button"
        onClick={onCreate}
        disabled={loading || !receivableId}
      >
        {loading ? "Creating settlement..." : "Create settlement"}
      </button>
      {result ? (
        <div className="result">
          <h3>Settlement created</h3>
          <JsonViewer value={result} />
        </div>
      ) : null}

      <div className="divider" />
      <label>
        Settlement ID
        <input
          value={settlementId}
          onChange={(event) => onSettlementIdChange(event.target.value)}
          placeholder="Paste the settlement ID"
        />
      </label>
      <button
        type="button"
        onClick={onLoadReport}
        disabled={loading || !settlementId}
      >
        Load report
      </button>
      {report ? (
        <div className="result">
          <h3>Settlement report</h3>
          <JsonViewer value={report} />
        </div>
      ) : null}
    </article>
  );
}
