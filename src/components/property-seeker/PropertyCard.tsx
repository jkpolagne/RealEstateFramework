import { formatPHP } from '../../lib/format';
import type { Property } from '../../types';
import { StatusBadge } from './StatusBadge';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  active?: boolean;
}

export function PropertyCard({ property, onClick, active }: PropertyCardProps) {
  return (
    <button
      type="button"
      className={`property-card${active ? ' property-card-active' : ''}`}
      onClick={() => onClick(property)}
    >
      <div className="property-card-image-wrap">
        <img src={property.heroImage} alt={property.name} className="property-card-image" />
        <span className="property-card-status">
          <StatusBadge status={property.status} />
        </span>
      </div>
      <div className="property-card-body">
        <p className="property-card-name">{property.name}</p>
        <p className="text-muted property-card-location">{property.location.address}</p>
        <div className="property-card-bottom">
          <span className="price">{formatPHP(property.price)}</span>
          <span className="property-card-details">Details</span>
        </div>
      </div>
    </button>
  );
}
