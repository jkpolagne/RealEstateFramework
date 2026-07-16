import type { Developer } from '../types';

export const developers: Developer[] = [
  {
    "id": "dev-1784158166970",
    "companyId": "company-1784158043492",
    "name": "Camella Homes",
    "totalCutPercent": 8,
    "status": "active",
    "directSale": {
      "brokerPercent": 3,
      "salesManagerPercent": 5
    },
    "referredSale": {
      "brokerPercent": 1,
      "salesManagerPercent": 2,
      "salesPersonPercent": 5
    }
  },
  {
    "id": "dev-1784159838001",
    "companyId": "company-1784158043492",
    "name": "Deca Homes",
    "totalCutPercent": 6,
    "status": "active",
    "directSale": {
      "brokerPercent": 1,
      "salesManagerPercent": 5
    },
    "referredSale": {
      "brokerPercent": 1,
      "salesManagerPercent": 2,
      "salesPersonPercent": 3
    }
  }
];
