import { useNavigate } from 'react-router-dom';
import type { Property } from '../../types';
import { formatPHP, formatSqm } from '../../lib/format';
import { useCompare } from '../../context/CompareContext';
import { StatusBadge } from './StatusBadge';

interface PropertyDetailPanelProps {
  property: Property;
  onClose: () => void;
}

export function PropertyDetailPanel({ property, onClose }: PropertyDetailPanelProps) {
  const navigate = useNavigate();
  const { isCompared, addToCompare, comparedIds } = useCompare();
  const compared = isCompared(property.id);
  const compareFull = comparedIds.length >= 2 && !compared;

  function handleAddToCompare() {
    const becameFull = addToCompare(property.id);
    if (becameFull) navigate('/compare');
  }

  return (
    <aside className="detail-panel card">
      <button type="button" className="btn-ghost detail-panel-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <img src={property.heroImage} alt={property.name} className="detail-panel-image" />
      <div className="detail-panel-body">
        <div className="detail-panel-top">
          <span className="price price-lg">{formatPHP(property.price)}</span>
          <StatusBadge status={property.status} />
        </div>
        <h3>{property.name}</h3>
        <p className="text-muted">{property.developerName}</p>
        <p className="text-muted">{property.location.address}</p>

        <dl className="detail-panel-specs">
          <div>
            <dt>Type</dt>
            <dd>{property.type}</dd>
          </div>
          <div>
            <dt>Lot area</dt>
            <dd>{formatSqm(property.lotArea)}</dd>
          </div>
          {property.floorArea > 0 && (
            <div>
              <dt>Floor area</dt>
              <dd>{formatSqm(property.floorArea)}</dd>
            </div>
          )}
          {property.bedrooms > 0 && (
            <div>
              <dt>Bedrooms</dt>
              <dd>{property.bedrooms}</dd>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div>
              <dt>Bathrooms</dt>
              <dd>{property.bathrooms}</dd>
            </div>
          )}
        </dl>

        <div className="detail-panel-actions">
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={handleAddToCompare}
            disabled={compared || compareFull}
          >
            {compared ? 'Added to Compare' : 'Add to Compare'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            View Full Details
          </button>
        </div>
      </div>
    </aside>
  );
}
