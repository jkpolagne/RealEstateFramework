import type { PropertyFilters, PropertyType } from '../../types';

interface FilterPanelProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  resultCount: number;
}

const PROPERTY_TYPES: (PropertyType | 'All')[] = ['All', 'House', 'Lot', 'House and Lot'];
const BEDROOM_OPTIONS: (number | 'Any')[] = ['Any', 0, 1, 2, 3, 4];

export function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  function set<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="filter-panel card">
      <h3>Search &amp; Filters</h3>

      <div className="field">
        <label htmlFor="filter-search">Search</label>
        <input
          id="filter-search"
          type="text"
          placeholder="Property name, developer..."
          value={filters.search ?? ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-location">Location</label>
        <input
          id="filter-location"
          type="text"
          placeholder="Naga City, Pili..."
          value={filters.location ?? ''}
          onChange={(e) => set('location', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-type">Property type</label>
        <select
          id="filter-type"
          value={filters.type ?? 'All'}
          onChange={(e) => set('type', e.target.value as PropertyType | 'All')}
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="filter-min-price">Min price</label>
          <input
            id="filter-min-price"
            type="number"
            min={0}
            placeholder="₱0"
            value={filters.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-max-price">Max price</label>
          <input
            id="filter-max-price"
            type="number"
            min={0}
            placeholder="Any"
            value={filters.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="filter-floor-area">Minimum floor area (sqm)</label>
        <input
          id="filter-floor-area"
          type="number"
          min={0}
          placeholder="Any"
          value={filters.minFloorArea ?? ''}
          onChange={(e) => set('minFloorArea', e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-house-model">House model</label>
        <input
          id="filter-house-model"
          type="text"
          placeholder="e.g. Bungalow"
          value={filters.houseModel ?? ''}
          onChange={(e) => set('houseModel', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-bedrooms">Bedrooms</label>
        <select
          id="filter-bedrooms"
          value={filters.bedrooms ?? 'Any'}
          onChange={(e) =>
            set('bedrooms', e.target.value === 'Any' ? 'Any' : Number(e.target.value))
          }
        >
          {BEDROOM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'Any' ? 'Any' : option}
            </option>
          ))}
        </select>
      </div>

      <p className="text-muted filter-result-count">{resultCount} propert{resultCount === 1 ? 'y' : 'ies'} found</p>
    </aside>
  );
}
