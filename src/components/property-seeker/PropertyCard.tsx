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
      <img src={property.heroImage} alt={property.name} className="property-card-image" />
      <div className="property-card-body">
        <div className="property-card-top">
          <span className="price">{formatPHP(property.price)}</span>
          <StatusBadge status={property.status} />
        </div>
        <p className="property-card-name">{property.name}</p>
        <p className="text-muted property-card-location">{property.location.address}</p>
      </div>
    </button>
  );
}
