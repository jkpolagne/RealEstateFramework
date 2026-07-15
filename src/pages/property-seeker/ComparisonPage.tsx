import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Property } from '../../types';
import { getPropertyById } from '../../services/propertyService';
import { useCompare } from '../../context/CompareContext';
import { formatPHP, formatSqm } from '../../lib/format';
import { StatusBadge } from '../../components/property-seeker/StatusBadge';

const ROWS: { label: string; render: (p: Property) => React.ReactNode }[] = [
  { label: 'Price', render: (p) => <span className="price">{formatPHP(p.price)}</span> },
  { label: 'Property type', render: (p) => p.type },
  { label: 'Lot area', render: (p) => formatSqm(p.lotArea) },
  { label: 'Floor area', render: (p) => (p.floorArea > 0 ? formatSqm(p.floorArea) : '—') },
  { label: 'Bedrooms', render: (p) => (p.bedrooms > 0 ? p.bedrooms : '—') },
  { label: 'Bathrooms', render: (p) => (p.bathrooms > 0 ? p.bathrooms : '—') },
  { label: 'Turnover status', render: (p) => p.turnoverStatus },
  { label: 'Location', render: (p) => p.location.address },
  { label: 'Developer', render: (p) => p.developerName },
  { label: 'Features', render: (p) => p.features.join(', ') },
  { label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
];

export function ComparisonPage() {
  const { comparedIds, removeFromCompare, clearCompare } = useCompare();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(comparedIds.map((id) => getPropertyById(id))).then((results) => {
      if (!cancelled) {
        setProperties(results.filter((p): p is Property => Boolean(p)));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comparedIds]);

  if (loading) return <div className="container comparison-page"><p className="text-muted">Loading comparison...</p></div>;

  if (properties.length < 2) {
    return (
      <div className="container comparison-page">
        <p className="text-muted">Select two properties to compare — add them from the map or property details page.</p>
        <Link to="/" className="btn btn-primary">Browse Properties</Link>
      </div>
    );
  }

  return (
    <div className="container comparison-page">
      <div className="comparison-header">
        <h2>Compare Properties</h2>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { clearCompare(); navigate('/'); }}>
          Clear comparison
        </button>
      </div>

      <div className="comparison-cards">
        {properties.map((property) => (
          <div key={property.id} className="card comparison-card">
            <img src={property.heroImage} alt={property.name} />
            <div className="comparison-card-body">
              <h3>{property.name}</h3>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                View Full Details
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-block"
                onClick={() => removeFromCompare(property.id)}
              >
                Remove from comparison
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                {properties.map((property) => (
                  <td key={property.id}>{row.render(property)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
