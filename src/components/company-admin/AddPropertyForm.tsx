import { useEffect, useState } from 'react';
import type { AddPropertyInput, Developer, PropertyStatus, PropertyType, TurnoverStatus } from '../../types';
import { getDevelopers } from '../../services/developerService';
import { addProperty } from '../../services/propertyService';
import { ImageUploadField } from './ImageUploadField';

interface AddPropertyFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const PROPERTY_TYPES: PropertyType[] = ['House', 'Lot', 'House and Lot'];
const STATUSES: PropertyStatus[] = ['available', 'reserved', 'sold'];
const TURNOVER_STATUSES: TurnoverStatus[] = ['Ready for turnover', 'Under construction'];

export function AddPropertyForm({ onClose, onAdded }: AddPropertyFormProps) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [name, setName] = useState('');
  const [developerId, setDeveloperId] = useState('');
  const [type, setType] = useState<PropertyType>('House and Lot');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('available');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('13.6218');
  const [lng, setLng] = useState('123.1948');
  const [lotArea, setLotArea] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [turnoverStatus, setTurnoverStatus] = useState<TurnoverStatus>('Ready for turnover');
  const [houseModel, setHouseModel] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [amenities, setAmenities] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDevelopers().then((result) => {
      setDevelopers(result);
      if (result.length > 0) setDeveloperId(result[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
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
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
      images,
    };
    await addProperty(input);
    setSubmitting(false);
    onAdded();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-property-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Property</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="prop-name">Property name</label>
              <input id="prop-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="prop-developer">Developer</label>
                <select id="prop-developer" required value={developerId} onChange={(e) => setDeveloperId(e.target.value)}>
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
                  <input id="prop-lat" type="number" step="0.0001" required value={lat} onChange={(e) => setLat(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="prop-lng">Longitude</label>
                  <input id="prop-lng" type="number" step="0.0001" required value={lng} onChange={(e) => setLng(e.target.value)} />
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
                <label htmlFor="prop-features">Features (comma-separated)</label>
                <input id="prop-features" type="text" value={features} onChange={(e) => setFeatures(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="prop-amenities">Amenities (comma-separated)</label>
                <input id="prop-amenities" type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
              </div>
            </fieldset>

            <ImageUploadField images={images} onChange={setImages} />

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !developerId}>
              {submitting ? 'Adding...' : 'Add Property'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
