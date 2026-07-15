import type { PropertyFilters, PropertyType } from '../../types';

interface FilterPanelProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  resultCount: number;
  onClose: () => void;
}

const PROPERTY_TYPES: (PropertyType | 'All')[] = ['All', 'House', 'Lot', 'House and Lot'];
const BEDROOM_OPTIONS: { value: number | 'Any'; label: string }[] = [
  { value: 'Any', label: 'Any' },
  { value: 1, label: '1 BR' },
  { value: 2, label: '2 BR' },
  { value: 3, label: '3 BR' },
  { value: 4, label: '4+' },
];
const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: '< 1M', max: 1_000_000 },
  { label: '1-3M', min: 1_000_000, max: 3_000_000 },
  { label: '3-6M', min: 3_000_000, max: 6_000_000 },
  { label: '> 6M', min: 6_000_000 },
];

export function FilterPanel({ filters, onChange, resultCount, onClose }: FilterPanelProps) {
  function set<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function applyPricePreset(preset: (typeof PRICE_PRESETS)[number]) {
    const isActive = filters.minPrice === preset.min && filters.maxPrice === preset.max;
    onChange({ ...filters, minPrice: isActive ? undefined : preset.min, maxPrice: isActive ? undefined : preset.max });
  }

  return (
    <aside className="filter-panel card">
      <div className="filter-panel-header">
        <span className="filter-panel-title">
          <span aria-hidden="true">☰</span> Search &amp; Filter
        </span>
        <button type="button" className="btn-ghost filter-panel-close" onClick={onClose} aria-label="Hide filters">
          ✕
        </button>
      </div>

      <div className="filter-panel-body scroll-y">
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
            placeholder="Barangay or street..."
            value={filters.location ?? ''}
            onChange={(e) => set('location', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Property type</span>
          <div className="filter-chip-row">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip${(filters.type ?? 'All') === type ? ' filter-chip-active' : ''}`}
                onClick={() => set('type', type)}
              >
                {type === 'House and Lot' ? 'House & Lot' : type === 'Lot' ? 'Lot Only' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Price range (₱)</span>
          <div className="field-row">
            <div className="field">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="field">
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className="filter-chip-row">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`filter-chip${filters.minPrice === preset.min && filters.maxPrice === preset.max ? ' filter-chip-active' : ''}`}
                onClick={() => applyPricePreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="filter-floor-area">Min. floor area (sqm)</label>
          <input
            id="filter-floor-area"
            type="number"
            min={0}
            placeholder="e.g. 80"
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

        <div className="filter-group">
          <span className="filter-group-label">No. of bedrooms</span>
          <div className="filter-chip-row">
            {BEDROOM_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={`filter-chip${(filters.bedrooms ?? 'Any') === option.value ? ' filter-chip-active' : ''}`}
                onClick={() => set('bedrooms', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-outline btn-block" onClick={() => onChange({})}>
          Reset Filters
        </button>
      </div>

      <p className="text-muted filter-result-count">
        Showing {resultCount} propert{resultCount === 1 ? 'y' : 'ies'}
      </p>
    </aside>
  );
}
