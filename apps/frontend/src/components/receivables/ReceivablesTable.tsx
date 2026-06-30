import type { Receivable } from "../../types";
import { CardHeader } from "../common/CardHeader";

type ReceivablesTableProps = {
  receivables: Receivable[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function ReceivablesTable({
  receivables,
  selectedId,
  onSelect,
}: ReceivablesTableProps) {
  return (
    <section className="grid">
      <article className="card">
        <CardHeader
          step="04"
          title="Receivables List"
          badge={`${receivables.length} records`}
        />
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Currency</th>
                <th>Value</th>
                <th>Due date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((receivable) => {
                const isSelected = selectedId === receivable.id;
                return (
                  <tr
                    key={receivable.id}
                    className={isSelected ? "selected-row" : undefined}
                  >
                    <td title={receivable.id}>{receivable.id.slice(0, 8)}...</td>
                    <td>
                      {receivable.receivableTypeCode ??
                        receivable.receivableType ??
                        "-"}
                    </td>
                    <td>{receivable.currencyCode}</td>
                    <td>{receivable.faceValue}</td>
                    <td>{receivable.dueDate}</td>
                    <td><span className="badge">{receivable.status}</span></td>
                    <td>
                      <button
                        type="button"
                        className={isSelected ? "secondary selected" : "secondary"}
                        onClick={() => onSelect(receivable.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
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
  );
}
