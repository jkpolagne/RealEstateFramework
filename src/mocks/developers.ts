import type { Developer } from '../types';

export const developers: Developer[] = [
  {
    id: 'dev-golden-horizon',
    name: 'Golden Horizon Developers',
    totalCutPercent: 6,
    status: 'active',
    directSale: { brokerPercent: 2, salesManagerPercent: 4 },
    referredSale: { brokerPercent: 2, salesManagerPercent: 1.5, salesPersonPercent: 2.5 },
  },
  {
    id: 'dev-bicol-homes',
    name: 'Bicol Homes Corporation',
    totalCutPercent: 6,
    status: 'active',
    directSale: { brokerPercent: 2, salesManagerPercent: 4 },
    referredSale: { brokerPercent: 2, salesManagerPercent: 1.5, salesPersonPercent: 2.5 },
  },
];
