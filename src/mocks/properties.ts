import type { Property } from '../types';
import { placeholderImage } from '../lib/placeholderImage';

function images(seed: string, name: string, count = 4): { hero: string; gallery: string[] } {
  const hero = placeholderImage(seed, name, 1000, 650);
  const gallery = Array.from({ length: count }, (_, i) =>
    placeholderImage(`${seed}-${i}`, `${name} ${i + 1}`, 800, 550),
  );
  return { hero, gallery };
}

const lot14 = images('lot-14-greenview', 'Lot 14, Greenview Estates');
const unit4b = images('unit-4b-riverside', 'Unit 4B, Riverside Homes');
const lot22 = images('lot-22-sunrise', 'Lot 22, Sunrise Heights');
const unit7 = images('unit-7-palmgrove', 'Unit 7, Palm Grove Residences');
const unit2 = images('unit-2-emerald', 'Unit 2, Emerald Court');
const unit10 = images('unit-10-hilltop', 'Unit 10, Hilltop Estates');

export const properties: Property[] = [
  {
    id: 'prop-lot14-greenview',
    name: 'Lot 14, Greenview Estates',
    developerId: 'dev-golden-horizon',
    developerName: 'Golden Horizon Developers',
    type: 'Lot',
    price: 1_500_000,
    status: 'available',
    location: { address: 'Greenview Estates, Naga City, Camarines Sur', lat: 13.6142, lng: 123.1893 },
    lotArea: 150,
    floorArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    turnoverStatus: 'Ready for turnover',
    houseModel: 'Lot Only',
    description:
      'A titled residential lot in the quiet Greenview Estates subdivision, close to Naga City proper — ideal as a build-your-own-home investment.',
    features: ['Titled property', 'Corner lot', 'Concrete road access'],
    amenities: ['Perimeter fence', 'Streetlights', '24/7 security'],
    heroImage: lot14.hero,
    gallery: lot14.gallery,
  },
  {
    id: 'prop-unit4b-riverside',
    name: 'Unit 4B, Riverside Homes',
    developerId: 'dev-golden-horizon',
    developerName: 'Golden Horizon Developers',
    type: 'House and Lot',
    price: 2_300_000,
    status: 'reserved',
    location: { address: 'Riverside Homes, Naga City, Camarines Sur', lat: 13.6295, lng: 123.2010 },
    lotArea: 80,
    floorArea: 65,
    bedrooms: 2,
    bathrooms: 1,
    turnoverStatus: 'Ready for turnover',
    houseModel: 'Riverside Duplex',
    description:
      'A move-in-ready duplex unit along the riverside community, a short drive from Naga City center with easy access to schools and markets.',
    features: ['Duplex unit', 'Provision for carport', 'Fully painted interior'],
    amenities: ['Clubhouse', 'Children’s playground', 'Covered basketball court'],
    heroImage: unit4b.hero,
    gallery: unit4b.gallery,
  },
  {
    id: 'prop-lot22-sunrise',
    name: 'Lot 22, Sunrise Heights',
    developerId: 'dev-golden-horizon',
    developerName: 'Golden Horizon Developers',
    type: 'Lot',
    price: 980_000,
    status: 'available',
    location: { address: 'Sunrise Heights, Pili, Camarines Sur', lat: 13.5521, lng: 123.2686 },
    lotArea: 120,
    floorArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    turnoverStatus: 'Ready for turnover',
    houseModel: 'Lot Only',
    description:
      'An affordable entry-level lot in Pili, minutes from the Camarines Sur capitol complex — a practical starter investment.',
    features: ['Titled property', 'Elevated terrain', 'Near national highway'],
    amenities: ['Concrete roads', 'Drainage system'],
    heroImage: lot22.hero,
    gallery: lot22.gallery,
  },
  {
    id: 'prop-unit7-palmgrove',
    name: 'Unit 7, Palm Grove Residences',
    developerId: 'dev-golden-horizon',
    developerName: 'Golden Horizon Developers',
    type: 'House and Lot',
    price: 3_650_000,
    status: 'available',
    location: { address: 'Palm Grove Residences, Naga City, Camarines Sur', lat: 13.6402, lng: 123.1785 },
    lotArea: 110,
    floorArea: 95,
    bedrooms: 3,
    bathrooms: 2,
    turnoverStatus: 'Under construction',
    houseModel: 'Palm Grove Deluxe',
    description:
      'A spacious 3-bedroom family home currently under construction, in a master-planned subdivision with wide roads and green open spaces.',
    features: ['Balcony', 'Provision for garage', 'High ceiling living area'],
    amenities: ['Clubhouse', 'Swimming pool', 'Landscaped park'],
    heroImage: unit7.hero,
    gallery: unit7.gallery,
  },
  {
    id: 'prop-unit2-emerald',
    name: 'Unit 2, Emerald Court',
    developerId: 'dev-bicol-homes',
    developerName: 'Bicol Homes Corporation',
    type: 'House and Lot',
    price: 1_850_000,
    status: 'available',
    location: { address: 'Emerald Court, Pili, Camarines Sur', lat: 13.5589, lng: 123.2812 },
    lotArea: 72,
    floorArea: 58,
    bedrooms: 2,
    bathrooms: 1,
    turnoverStatus: 'Ready for turnover',
    houseModel: 'Emerald Bungalow',
    description:
      'A cozy single-story bungalow close to Pili’s commercial district, well suited for a young family or first-time homebuyer.',
    features: ['Single-story layout', 'Front porch', 'Ready for turnover'],
    amenities: ['Gated entrance', 'Community water system'],
    heroImage: unit2.hero,
    gallery: unit2.gallery,
  },
  {
    id: 'prop-unit10-hilltop',
    name: 'Unit 10, Hilltop Estates',
    developerId: 'dev-bicol-homes',
    developerName: 'Bicol Homes Corporation',
    type: 'House and Lot',
    price: 5_200_000,
    status: 'available',
    location: { address: 'Hilltop Estates, Naga City, Camarines Sur', lat: 13.6488, lng: 123.2077 },
    lotArea: 160,
    floorArea: 140,
    bedrooms: 4,
    bathrooms: 3,
    turnoverStatus: 'Under construction',
    houseModel: 'Hilltop Grand',
    description:
      'An upscale 4-bedroom, 2-storey home with a hilltop view of Naga City, designed for growing families wanting extra space.',
    features: ['2-storey layout', 'Maid’s room', 'Provision for 2-car garage'],
    amenities: ['Clubhouse', 'Swimming pool', 'Scenic viewing deck', '24/7 security'],
    heroImage: unit10.hero,
    gallery: unit10.gallery,
  },
];
