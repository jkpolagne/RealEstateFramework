import { useEffect, useState } from 'react';
import type { AddPropertyInput, Developer, Property, PropertyStatus, PropertyType, TurnoverStatus } from '../../types';
import { getDevelopers } from '../../services/developerService';
import { addProperty, updateProperty } from '../../services/propertyService';
import { ImageUploadField } from './ImageUploadField';

interface PropertyFormProps {
  property?: Property;
  onClose: () => void;
  onSaved: () => void;
}

const PROPERTY_TYPES: PropertyType[] = ['House', 'Lot', 'House and Lot'];
const STATUSES: PropertyStatus[] = ['available', 'reserved', 'sold'];
const TURNOVER_STATUSES: TurnoverStatus[] = ['Ready for turnover', 'Under construction'];

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function PropertyForm({ property, onClose, onSaved }: PropertyFormProps) {
  const isEdit = Boolean(property);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [name, setName] = useState(property?.name ?? '');
  const [developerId, setDeveloperId] = useState(property?.developerId ?? '');
  const [type, setType] = useState<PropertyType>(property?.type ?? 'House and Lot');
  const [price, setPrice] = useState(property ? String(property.price) : '');
  const [status, setStatus] = useState<PropertyStatus>(property?.status ?? 'available');
  const [address, setAddress] = useState(property?.location.address ?? '');
  const [lat, setLat] = useState(property ? String(property.location.lat) : '13.6218');
  const [lng, setLng] = useState(property ? String(property.location.lng) : '123.1948');
  const [lotArea, setLotArea] = useState(property ? String(property.lotArea) : '');
  const [floorArea, setFloorArea] = useState(property ? String(property.floorArea) : '');
  const [bedrooms, setBedrooms] = useState(property ? String(property.bedrooms) : '0');
  const [bathrooms, setBathrooms] = useState(property ? String(property.bathrooms) : '0');
  const [turnoverStatus, setTurnoverStatus] = useState<TurnoverStatus>(property?.turnoverStatus ?? 'Ready for turnover');
  const [houseModel, setHouseModel] = useState(property?.houseModel ?? '');
  const [description, setDescription] = useState(property?.description ?? '');
  const [features, setFeatures] = useState(property?.features.join(', ') ?? '');
  const [amenities, setAmenities] = useState(property?.amenities.join(', ') ?? '');
  const [images, setImages] = useState<string[]>(property ? [property.heroImage, ...property.gallery] : []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDevelopers().then((result) => {
      setDevelopers(result);
      if (!isEdit && result.length > 0) setDeveloperId(result[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: AddPropertyInput = {
      name,
      developerId,
      type,
      price: Number(price),
      status,
      address,
      lat: Number(lat),
      lng: Number(lng),
      lotArea: Number(lotArea) || 0,
      floorArea: Number(floorArea) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      turnoverStatus,
      houseModel,
      description,
      features: parseTags(features),
      amenities: parseTags(amenities),
      images,
    };
    try {
      if (isEdit && property) {
        await updateProperty(property.id, input);
      } else {
        await addProperty(input);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-property-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Property' : 'Add Property'}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <fieldset className="admin-fieldset">
              <legend>Basic information</legend>
              <div className="field">
                <label htmlFor="prop-name">Property name</label>
                <input id="prop-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prop-developer">Developer</label>
                  <select id="prop-developer" required value={developerId} onChange={(e) => setDeveloperId(e.target.value)}>
                    {isEdit && developerId && !developers.some((d) => d.id === developerId) && (
                      <option value={developerId}>{property?.developerName ?? 'Loading...'}</option>
                    )}
                    {developers.map((developer) => (
                      <option key={developer.id} value={developer.id}>
                        {developer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="prop-type">Property type</label>
                  <select id="prop-type" value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prop-price">Price (₱)</label>
                  <input id="prop-price" type="number" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prop-status">Status</label>
                  <select id="prop-status" value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Location</legend>
              <div className="field">
                <label htmlFor="prop-address">Address</label>
                <input
                  id="prop-address"
                  type="text"
                  required
                  placeholder="e.g. Greenview Estates, Naga City, Camarines Sur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prop-lat">Latitude</label>
                  <input
                    id="prop-lat"
                    type="number"
                    step="0.0001"
                    min={-90}
                    max={90}
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="prop-lng">Longitude</label>
                  <input
                    id="prop-lng"
                    type="number"
                    step="0.0001"
                    min={-180}
                    max={180}
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Property details</legend>
              <div className="field-row field-row-4">
                <div className="field">
                  <label htmlFor="prop-lot-area">Lot area (sqm)</label>
                  <input id="prop-lot-area" type="number" min={0} value={lotArea} onChange={(e) => setLotArea(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prop-floor-area">Floor area (sqm)</label>
                  <input id="prop-floor-area" type="number" min={0} value={floorArea} onChange={(e) => setFloorArea(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prop-bedrooms">Bedrooms</label>
                  <input id="prop-bedrooms" type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prop-bathrooms">Bathrooms</label>
                  <input id="prop-bathrooms" type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="prop-turnover">Turnover status</label>
                  <select id="prop-turnover" value={turnoverStatus} onChange={(e) => setTurnoverStatus(e.target.value as TurnoverStatus)}>
                    {TURNOVER_STATUSES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="prop-house-model">House model</label>
                  <input id="prop-house-model" type="text" value={houseModel} onChange={(e) => setHouseModel(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="prop-description">Description</label>
                <textarea id="prop-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="prop-features">Features</label>
                <input
                  id="prop-features"
                  type="text"
                  placeholder="e.g. Balcony, Provision for garage"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                />
                <p className="text-muted field-help">Separate with commas.</p>
                {parseTags(features).length > 0 && (
                  <div className="details-tag-list">
                    {parseTags(features).map((tag) => (
                      <span key={tag} className="details-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="prop-amenities">Amenities</label>
                <input
                  id="prop-amenities"
                  type="text"
                  placeholder="e.g. Clubhouse, Swimming pool"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                />
                <p className="text-muted field-help">Separate with commas.</p>
                {parseTags(amenities).length > 0 && (
                  <div className="details-tag-list">
                    {parseTags(amenities).map((tag) => (
                      <span key={tag} className="details-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Images</legend>
              <ImageUploadField images={images} onChange={setImages} />
            </fieldset>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !developerId}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Property'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
