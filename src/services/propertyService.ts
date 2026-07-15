import type { Property, PropertyFilters } from '../types';
import { properties } from '../mocks/properties';
import { delay } from '../lib/delay';

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  await delay();
  if (!filters) return properties;

  return properties.filter((property) => {
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
