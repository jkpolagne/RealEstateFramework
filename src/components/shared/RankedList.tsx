export interface RankedListRow {
  id: string;
  name: string;
  value: string;
  subtitle?: string;
}

export function RankedList({ rows }: { rows: RankedListRow[] }) {
  if (rows.length === 0) return <p className="text-muted">Nothing to rank yet.</p>;

  return (
    <ol className="admin-ranked-list">
      {rows.map((row, i) => (
        <li key={row.id}>
          <span className="admin-ranked-position">{i + 1}</span>
          <span className="admin-ranked-name">
            {row.name}
            {row.subtitle && <span className="text-muted admin-ranked-subtitle"> — {row.subtitle}</span>}
          </span>
          <span className="price">{row.value}</span>
        </li>
      ))}
    </ol>
  );
}
