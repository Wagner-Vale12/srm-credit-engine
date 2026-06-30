type AppHeaderProps = {
  loading: boolean;
  onReload: () => void;
};

export function AppHeader({ loading, onReload }: AppHeaderProps) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">SRM Credit Engine</p>
        <h1>Frontend MVP</h1>
        <p>
          End-to-end demonstration for creation, pricing, and settlement of
          multi-currency receivables.
        </p>
      </div>
      <button type="button" onClick={onReload} disabled={loading}>
        {loading ? "Loading..." : "Reload data"}
      </button>
    </section>
  );
}
