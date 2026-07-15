import { useEffect, useState } from 'react';
import type { Property, PropertyFilters } from '../../types';
import { getProperties } from '../../services/propertyService';
import { FilterPanel } from '../../components/property-seeker/FilterPanel';
import { MapView } from '../../components/property-seeker/MapView';
import { PropertyCard } from '../../components/property-seeker/PropertyCard';
import { PropertyDetailPanel } from '../../components/property-seeker/PropertyDetailPanel';

export function BrowsePage() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [closePopupSignal, setClosePopupSignal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProperties(filters).then((result) => {
      if (!cancelled) {
        setProperties(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  function handleMarkerSelect(property: Property) {
    setSelectedProperty(property);
  }

  function handleCardSelect(property: Property) {
    setSelectedProperty(property);
    setClosePopupSignal((tick) => tick + 1);
  }

  function handleClosePanel() {
    setSelectedProperty(null);
    setClosePopupSignal((tick) => tick + 1);
  }

  return (
    <div className="browse-view">
      <FilterPanel filters={filters} onChange={setFilters} resultCount={properties.length} />

      <div className="browse-center">
        <div className="browse-map">
          <MapView
            properties={properties}
            selectedPropertyId={selectedProperty?.id ?? null}
            onMarkerClick={handleMarkerSelect}
            closePopupSignal={closePopupSignal}
          />
        </div>

        <div className="browse-list">
          {loading ? (
            <p className="text-muted">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-muted">No properties match your filters.</p>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  active={selectedProperty?.id === property.id}
                  onClick={handleCardSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailPanel property={selectedProperty} onClose={handleClosePanel} />
      )}
    </div>
  );
}
