import type { PropertyStatus } from '../../types';

const LABELS: Record<PropertyStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return <span className={`badge badge-${status}`}>{LABELS[status]}</span>;
}
