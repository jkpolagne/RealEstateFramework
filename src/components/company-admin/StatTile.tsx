interface StatTileProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatTile({ label, value, accent }: StatTileProps) {
  return (
    <div className="card stat-tile">
      <p className="stat-tile-label text-muted">{label}</p>
      <p className={`stat-tile-value${accent ? ' stat-tile-value-accent' : ''}`}>{value}</p>
    </div>
  );
}
