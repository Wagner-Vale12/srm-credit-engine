import type { ReceivableQuery } from "../types";

type Props = {
  value: ReceivableQuery;
  onChange: (value: ReceivableQuery) => void;
};

export function ReceivableFilters({ value, onChange }: Props) {
  const update = (field: keyof ReceivableQuery, next: string) =>
    onChange({ ...value, [field]: next || undefined, page: 1 });

  return (
    <div className="filters">
      <label>Status<select value={value.status ?? ""} onChange={(e) => update("status", e.target.value)}><option value="">All</option><option>REGISTERED</option><option>PRICED</option><option>SETTLED</option><option>CANCELLED</option></select></label>
      <label>Currency<select value={value.currencyCode ?? ""} onChange={(e) => update("currencyCode", e.target.value)}><option value="">All</option><option>BRL</option><option>USD</option></select></label>
      <label>Type<select value={value.receivableTypeCode ?? ""} onChange={(e) => update("receivableTypeCode", e.target.value)}><option value="">All</option><option value="DUPLICATA_MERCANTIL">Trade Invoice</option><option value="CHEQUE_PRE_DATADO">Post-dated Check</option></select></label>
      <label>Cedent<input value={value.cedentId ?? ""} placeholder="Cedent UUID" onChange={(e) => update("cedentId", e.target.value)} /></label>
      <label>Due date from<input type="date" value={value.dueDateFrom ?? ""} onChange={(e) => update("dueDateFrom", e.target.value)} /></label>
      <label>Due date to<input type="date" value={value.dueDateTo ?? ""} onChange={(e) => update("dueDateTo", e.target.value)} /></label>
    </div>
  );
}
