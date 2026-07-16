import type { ConsultantAccount } from '../types';

export const consultantAccounts: ConsultantAccount[] = [
  {
    "id": "consultant-1784162093317",
    "companyId": "company-1784158043492",
    "firstName": "Jann Kevin",
    "middleName": "F",
    "lastName": "Polagne",
    "email": "jann@gmail.com",
    "contactNumber": "09876537821",
    "password": "123456789",
    "role": "Broker",
    "assignedUnderId": null,
    "status": "active",
    "createdAt": "2026-07-16T00:34:53.317Z"
  },
  {
    "id": "consultant-1784162142449",
    "companyId": "company-1784158043492",
    "firstName": "Jerome Mark",
    "middleName": "M",
    "lastName": "Salud",
    "email": "jerome@gmail.com",
    "contactNumber": "09865327683",
    "password": "123456789",
    "role": "Sales Manager",
    "assignedUnderId": "consultant-1784162093317",
    "status": "active",
    "createdAt": "2026-07-16T00:35:42.449Z"
  },
  {
    "id": "consultant-1784162164459",
    "companyId": "company-1784158043492",
    "firstName": "Sean Rey",
    "middleName": "O",
    "lastName": "Dizon",
    "email": "sean@gmail.com",
    "contactNumber": "09675368723",
    "password": "123456789",
    "role": "Sales Person",
    "assignedUnderId": "consultant-1784162142449",
    "status": "active",
    "createdAt": "2026-07-16T00:36:04.459Z"
  }
];
