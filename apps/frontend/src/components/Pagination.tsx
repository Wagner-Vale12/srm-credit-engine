type Props = { page: number; totalPages: number; limit: number; onPageChange: (page: number) => void; onLimitChange: (limit: number) => void };

export function Pagination({ page, totalPages, limit, onPageChange, onLimitChange }: Props) {
  return <div className="pagination"><button type="button" className="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button><span>Page {page} of {Math.max(totalPages, 1)}</span><button type="button" className="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button><label>Per page<select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label></div>;
}
