import type { ConsultantAccount, Developer, Property, Sale } from '../types';
import { sales } from '../mocks/sales';
import { delay } from '../lib/delay';

export async function getSales(): Promise<Sale[]> {
  await delay();
  return sales;
}

export interface DeveloperBreakdownRow {
  developerId: string;
  developerName: string;
  totalSales: number;
  saleCount: number;
}

export interface ConsultantBreakdownRow {
  consultantId: string;
  consultantName: string;
  totalSales: number;
  saleCount: number;
}

export interface SalesReport {
  totalSales: number;
  saleCount: number;
  byDeveloper: DeveloperBreakdownRow[];
  byConsultant: ConsultantBreakdownRow[];
  topConsultants: ConsultantBreakdownRow[];
}

function consultantName(id: string, accounts: ConsultantAccount[]): string {
  const account = accounts.find((a) => a.id === id);
  return account ? `${account.firstName} ${account.lastName}`.trim() : 'Unknown Consultant';
}

/** Attributes a sale to its front-line consultant: the Sales Person if referred, else the Sales Manager. */
function primaryConsultantId(sale: Sale): string | null {
  return sale.salesPersonId ?? sale.salesManagerId ?? sale.brokerId;
}

export function buildSalesReport(
  salesInRange: Sale[],
  developers: Developer[],
  consultantAccounts: ConsultantAccount[],
): SalesReport {
  const totalSales = salesInRange.reduce((sum, s) => sum + s.salePrice, 0);

  const developerMap = new Map<string, DeveloperBreakdownRow>();
  for (const sale of salesInRange) {
    const developer = developers.find((d) => d.id === sale.developerId);
    const key = sale.developerId;
    const existing = developerMap.get(key);
    if (existing) {
      existing.totalSales += sale.salePrice;
      existing.saleCount += 1;
    } else {
      developerMap.set(key, {
        developerId: key,
        developerName: developer?.name ?? 'Unknown Developer',
        totalSales: sale.salePrice,
        saleCount: 1,
      });
    }
  }

  const consultantMap = new Map<string, ConsultantBreakdownRow>();
  for (const sale of salesInRange) {
    const id = primaryConsultantId(sale);
    if (!id) continue;
    const existing = consultantMap.get(id);
    if (existing) {
      existing.totalSales += sale.salePrice;
      existing.saleCount += 1;
    } else {
      consultantMap.set(id, {
        consultantId: id,
        consultantName: consultantName(id, consultantAccounts),
        totalSales: sale.salePrice,
        saleCount: 1,
      });
    }
  }

  const byConsultant = [...consultantMap.values()].sort((a, b) => b.totalSales - a.totalSales);

  return {
    totalSales,
    saleCount: salesInRange.length,
    byDeveloper: [...developerMap.values()].sort((a, b) => b.totalSales - a.totalSales),
    byConsultant,
    topConsultants: byConsultant.slice(0, 5),
  };
}

export function propertyName(sale: Sale, properties: Property[]): string {
  return properties.find((p) => p.id === sale.propertyId)?.name ?? 'Unknown Property';
}
