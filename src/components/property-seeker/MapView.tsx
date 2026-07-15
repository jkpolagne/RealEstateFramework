import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Property } from '../../types';
import { formatPHP } from '../../lib/format';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const goldIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-selected',
});

const NAGA_CENTER: [number, number] = [13.6218, 123.1948];

/** Closes any open Leaflet popup when `signal` changes — used to clear a marker's popup after a non-marker selection (e.g. a list card click). */
function PopupCloser({ signal }: { signal: number }) {
  const map = useMap();
  useEffect(() => {
    map.closePopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);
  return null;
}

interface MapViewProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onMarkerClick: (property: Property) => void;
  closePopupSignal?: number;
}

export function MapView({ properties, selectedPropertyId, onMarkerClick, closePopupSignal }: MapViewProps) {
  const center = useMemo<[number, number]>(() => {
    if (properties.length === 0) return NAGA_CENTER;
    const avgLat = properties.reduce((sum, p) => sum + p.location.lat, 0) / properties.length;
    const avgLng = properties.reduce((sum, p) => sum + p.location.lng, 0) / properties.length;
    return [avgLat, avgLng];
  }, [properties]);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {closePopupSignal != null && <PopupCloser signal={closePopupSignal} />}
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.location.lat, property.location.lng]}
          icon={property.id === selectedPropertyId ? goldIcon : defaultIcon}
          eventHandlers={{ click: () => onMarkerClick(property) }}
        >
          <Popup>
            <div className="map-popup">
              <img src={property.heroImage} alt={property.name} />
              <div className="map-popup-body">
                <p className="map-popup-name">{property.name}</p>
                <p className="map-popup-location text-muted">{property.location.address}</p>
                <p className="price">{formatPHP(property.price)}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
