import type { AddCompanyInput, Company } from '../types';
import { companies } from '../mocks/companies';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';
import { recordSystemLog } from './systemLogService';

export async function getCompanies(): Promise<Company[]> {
  await delay();
  return companies;
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  await delay();
  return companies.find((c) => c.id === id);
}

function nextCompanyCode(): string {
  const maxNumber = companies.reduce((max, c) => {
    const num = Number(c.code.replace('C-', ''));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `C-${String(maxNumber + 1).padStart(3, '0')}`;
}

export async function addCompany(input: AddCompanyInput): Promise<Company> {
  await delay(400);
  const company: Company = {
    id: `company-${Date.now()}`,
    code: nextCompanyCode(),
    name: input.name,
    address: input.address,
    email: input.email,
    contactNumber: input.contactNumber,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  companies.push(company);
  recordSystemLog('company_created', `Company "${company.name}" (${company.code}) was registered.`, company.id);
  persistAll();
  return company;
}

export async function updateCompanyStatus(id: string, status: 'active' | 'inactive'): Promise<Company> {
  await delay(300);
  const company = companies.find((c) => c.id === id);
  if (!company) throw new Error('Company not found');

  if (company.status !== status) {
    const from = company.status === 'active' ? 'Active' : 'Inactive';
    const to = status === 'active' ? 'Active' : 'Inactive';
    company.status = status;
    recordSystemLog(
      'company_status_changed',
      `Company "${company.name}" (${company.code}) status changed from ${from} to ${to}.`,
      company.id,
    );
  }
  persistAll();
  return company;
}
