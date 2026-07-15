import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Property } from '../../types';
import { getPropertyById, getSimilarProperties } from '../../services/propertyService';
import { formatPHP, formatSqm } from '../../lib/format';
import { useCompare } from '../../context/CompareContext';
import { useConsultantLink } from '../../context/ConsultantLinkContext';
import { StatusBadge } from '../../components/property-seeker/StatusBadge';
import { PropertyCard } from '../../components/property-seeker/PropertyCard';
import { ScheduleVisitModal } from '../../components/property-seeker/ScheduleVisitModal';

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCompared, addToCompare, comparedIds } = useCompare();
  const { activeLink, loading: consultantLoading } = useConsultantLink();

  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getPropertyById(id).then(async (result) => {
      if (cancelled) return;
      setProperty(result ?? null);
      setActiveImage(result?.heroImage ?? null);
      if (result) {
        const similarResult = await getSimilarProperties(result);
        if (!cancelled) setSimilar(similarResult);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="container details-page"><p className="text-muted">Loading property...</p></div>;

  if (!property) {
    return (
      <div className="container details-page">
        <p className="text-muted">Property not found.</p>
        <Link to="/" className="btn btn-primary">Browse Properties</Link>
      </div>
    );
  }

  const compared = isCompared(property.id);
  const compareFull = comparedIds.length >= 2 && !compared;

  function handleAddToCompare() {
    const becameFull = addToCompare(property!.id);
    if (becameFull) navigate('/compare');
  }

  return (
    <div className="container details-page">
      <img src={activeImage ?? property.heroImage} alt={property.name} className="details-hero" />
      <div className="details-gallery">
        {[property.heroImage, ...property.gallery].map((img, i) => (
          <button
            key={i}
            type="button"
            className={`details-gallery-thumb${activeImage === img ? ' details-gallery-thumb-active' : ''}`}
            onClick={() => setActiveImage(img)}
          >
            <img src={img} alt={`${property.name} ${i + 1}`} />
          </button>
        ))}
      </div>

      <div className="details-content">
        <div className="details-main">
          <div className="details-title-row">
            <div>
              <p className="price price-lg">{formatPHP(property.price)}</p>
              <h2>{property.name}</h2>
              <p className="text-muted">{property.developerName}</p>
            </div>
            <StatusBadge status={property.status} />
          </div>

          <dl className="detail-panel-specs details-specs-grid">
            <div><dt>Type</dt><dd>{property.type}</dd></div>
            <div><dt>Location</dt><dd>{property.location.address}</dd></div>
            <div><dt>Lot area</dt><dd>{formatSqm(property.lotArea)}</dd></div>
            {property.floorArea > 0 && <div><dt>Floor area</dt><dd>{formatSqm(property.floorArea)}</dd></div>}
            {property.bedrooms > 0 && <div><dt>Bedrooms</dt><dd>{property.bedrooms}</dd></div>}
            {property.bathrooms > 0 && <div><dt>Bathrooms</dt><dd>{property.bathrooms}</dd></div>}
            <div><dt>Turnover status</dt><dd>{property.turnoverStatus}</dd></div>
            <div><dt>House model</dt><dd>{property.houseModel}</dd></div>
          </dl>

          <section className="details-section">
            <h3>Description</h3>
            <p>{property.description}</p>
          </section>

          <section className="details-section">
            <h3>Features &amp; Amenities</h3>
            <div className="details-tag-list">
              {[...property.features, ...property.amenities].map((tag) => (
                <span key={tag} className="details-tag">{tag}</span>
              ))}
            </div>
          </section>

          <section className="details-section">
            <h3>Specifications</h3>
            <p className="text-muted">
              {property.type} · {property.houseModel} · {property.turnoverStatus}
            </p>
          </section>

          <section className="details-section">
            <h3>Location</h3>
            <div className="details-mini-map">
              <MapContainer
                center={[property.location.lat, property.location.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[property.location.lat, property.location.lng]} icon={pinIcon} />
              </MapContainer>
            </div>
          </section>
        </div>

        <aside className="details-side">
          <div className="card card-accent details-side-card">
            <p className="price price-lg">{formatPHP(property.price)}</p>
            <StatusBadge status={property.status} />
            <dl className="details-side-specs">
              <div><dt>Type</dt><dd>{property.type}</dd></div>
              <div><dt>Turnover status</dt><dd>{property.turnoverStatus}</dd></div>
              {property.bedrooms > 0 && <div><dt>Bedrooms</dt><dd>{property.bedrooms}</dd></div>}
            </dl>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setScheduleOpen(true)}
              disabled={property.status === 'sold'}
            >
              {property.status === 'sold' ? 'Sold — Not Available' : 'Schedule Visit'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={handleAddToCompare}
              disabled={compared || compareFull}
            >
              {compared ? 'Added to Compare' : 'Add to Compare'}
            </button>
          </div>

          {!consultantLoading && activeLink && (
            <div className="card details-consultant-card">
              <p className="details-consultant-label text-muted">Your assigned consultant</p>
              <p className="details-consultant-name">{activeLink.consultantName}</p>
              <p className="text-muted">{activeLink.role}</p>
              <p>{activeLink.contactNumber}</p>
              <p>{activeLink.email}</p>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="details-section">
          <h3>Similar Properties</h3>
          <div className="property-grid">
            {similar.map((similarProperty) => (
              <PropertyCard
                key={similarProperty.id}
                property={similarProperty}
                onClick={(p) => navigate(`/property/${p.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {scheduleOpen && (
        <ScheduleVisitModal
          propertyId={property.id}
          propertyName={property.name}
          onClose={() => setScheduleOpen(false)}
        />
      )}
    </div>
  );
}
