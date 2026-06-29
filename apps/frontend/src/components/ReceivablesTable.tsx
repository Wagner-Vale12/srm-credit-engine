import type { Receivable } from "../types";

type Props = { items: Receivable[]; selectedId: string; onSelect: (id: string) => void };

export function ReceivablesTable({ items, selectedId, onSelect }: Props) {
  return <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Cedent</th><th>Type</th><th>Currency</th><th>Value</th><th>Due date</th><th>Status</th><th>Action</th></tr></thead><tbody>
    {items.length === 0 ? <tr><td colSpan={8}>No receivables found.</td></tr> : items.map((item) => <tr key={item.id} className={selectedId === item.id ? "selected-row" : undefined}>
      <td title={item.id}>{item.id.slice(0, 8)}...</td><td>{item.cedentName ?? "-"}</td><td>{item.receivableTypeCode ?? item.receivableType ?? "-"}</td><td>{item.currencyCode}</td><td>{item.faceValue}</td><td>{item.dueDate}</td><td><span className="badge">{item.status}</span></td><td><button type="button" className="secondary" onClick={() => onSelect(item.id)}>{selectedId === item.id ? "Selected" : "Select"}</button></td>
    </tr>)}
  </tbody></table></div>;
}
