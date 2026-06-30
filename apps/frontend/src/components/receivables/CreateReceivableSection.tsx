import type { Dispatch, SetStateAction } from "react";
import type { CreateReceivablePayload, Receivable } from "../../types";
import { CardHeader } from "../common/CardHeader";
import { JsonViewer } from "../common/JsonViewer";

type CreateReceivableSectionProps = {
  form: CreateReceivablePayload;
  createdReceivable: Receivable | null;
  loading: boolean;
  onFormChange: Dispatch<SetStateAction<CreateReceivablePayload>>;
  onCreate: () => void;
  onReset: () => void;
};

export function CreateReceivableSection({
  form,
  createdReceivable,
  loading,
  onFormChange,
  onCreate,
  onReset,
}: CreateReceivableSectionProps) {
  function updateField(
    field: keyof CreateReceivablePayload,
    value: string,
  ) {
    onFormChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="grid">
      <article className="card">
        <CardHeader step="03" title="Create Receivable" />
        <div className="form-grid">
          <label>
            Cedent ID
            <input
              value={form.cedentId}
              onChange={(event) => updateField("cedentId", event.target.value)}
              placeholder="Paste the seeded cedent ID"
            />
          </label>
          <label>
            Type
            <select
              value={form.receivableTypeCode}
              onChange={(event) =>
                updateField("receivableTypeCode", event.target.value)
              }
            >
              <option value="DUPLICATA_MERCANTIL">Duplicata Mercantil</option>
              <option value="CHEQUE_PRE_DATADO">Cheque Pre-datado</option>
            </select>
          </label>
          <label>
            Currency
            <select
              value={form.currencyCode}
              onChange={(event) =>
                updateField("currencyCode", event.target.value)
              }
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label>
            Face value
            <input
              value={form.faceValue}
              onChange={(event) => updateField("faceValue", event.target.value)}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateField("dueDate", event.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={loading || !form.cedentId || Boolean(createdReceivable)}
        >
          {loading
            ? "Creating..."
            : createdReceivable
              ? "Receivable created"
              : "Create receivable"}
        </button>
        {createdReceivable ? (
          <>
            <button type="button" className="secondary" onClick={onReset}>
              Create another receivable
            </button>
            <div className="result">
              <h3>Receivable created</h3>
              <JsonViewer value={createdReceivable} />
            </div>
          </>
        ) : null}
      </article>
    </section>
  );
}
