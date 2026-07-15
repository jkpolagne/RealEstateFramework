interface StatTileProps {
  label: string;
  value: string;
  accent?: boolean;
  /** Small muted line under the value, e.g. "per month" or "over 20 years". */
  hint?: string;
  /** Solid navy-filled tile for the single most important stat in a row. */
  fill?: boolean;
}

export function StatTile({ label, value, accent, hint, fill }: StatTileProps) {
  return (
    <div className={`card stat-tile${fill ? ' stat-tile-fill' : ''}`}>
      <p className="stat-tile-label text-muted">{label}</p>
      <p className={`stat-tile-value${accent ? ' stat-tile-value-accent' : ''}`}>{value}</p>
      {hint && <p className="stat-tile-hint text-muted">{hint}</p>}
    </div>
  );
}
