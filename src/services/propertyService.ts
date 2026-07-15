import type { AddPropertyInput, Property, PropertyFilters } from '../types';
import { properties } from '../mocks/properties';
import { developers } from '../mocks/developers';
import { delay } from '../lib/delay';
import { placeholderImage } from '../lib/placeholderImage';

/** Public-facing listing — sold units aren't marketed to new seekers. */
export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  await delay();
  const listable = properties.filter((p) => p.status !== 'sold');
  if (!filters) return listable;

  return listable.filter((property) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        property.name.toLowerCase().includes(q) ||
        property.location.address.toLowerCase().includes(q) ||
        property.developerName.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.location) {
      if (!property.location.address.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    if (filters.type && filters.type !== 'All' && property.type !== filters.type) return false;
    if (filters.minPrice != null && property.price < filters.minPrice) return false;
    if (filters.maxPrice != null && property.price > filters.maxPrice) return false;
    if (filters.minFloorArea != null && property.floorArea < filters.minFloorArea) return false;
    if (filters.houseModel) {
      if (!property.houseModel.toLowerCase().includes(filters.houseModel.toLowerCase())) return false;
    }
    if (filters.bedrooms != null && filters.bedrooms !== 'Any' && property.bedrooms !== filters.bedrooms) {
      return false;
    }
    return true;
  });
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await delay();
  return properties.find((p) => p.id === id);
}

export async function getSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  await delay(250);
  return properties
    .filter(
      (p) =>
        p.id !== property.id &&
        (p.location.address === property.location.address || p.type === property.type),
    )
    .slice(0, limit);
}

export async function getAvailableProperties(): Promise<Property[]> {
  await delay();
  return properties.filter((p) => p.status !== 'sold');
}

/** Company Admin sees every property regardless of status. */
export async function getAllPropertiesForAdmin(): Promise<Property[]> {
  await delay();
  return properties;
}

export async function addProperty(input: AddPropertyInput): Promise<Property> {
  await delay(500);
  const developer = developers.find((d) => d.id === input.developerId);
  const images =
    input.images.length > 0
      ? input.images
      : [0, 1, 2].map((i) => placeholderImage(`${input.name}-${i}`, `${input.name} ${i + 1}`, 800, 550));

  const property: Property = {
    id: `prop-${Date.now()}`,
    name: input.name,
    developerId: input.developerId,
    developerName: developer?.name ?? 'Unknown Developer',
    type: input.type,
    price: input.price,
    status: input.status,
    location: { address: input.address, lat: input.lat, lng: input.lng },
    lotArea: input.lotArea,
    floorArea: input.floorArea,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    turnoverStatus: input.turnoverStatus,
    houseModel: input.houseModel,
    description: input.description,
    features: input.features,
    amenities: input.amenities,
    heroImage: images[0],
    gallery: images.slice(1),
  };
  properties.push(property);
  return property;
}
