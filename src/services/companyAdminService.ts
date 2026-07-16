import type { AddCompanyAdminInput, CompanyAdminAccount } from '../types';
import { companyAdmins } from '../mocks/companyAdmins';
import { companies } from '../mocks/companies';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';
import { recordSystemLog } from './systemLogService';

export async function getCompanyAdmins(): Promise<CompanyAdminAccount[]> {
  await delay();
  return companyAdmins;
}

export async function getCompanyAdminsByCompany(companyId: string): Promise<CompanyAdminAccount[]> {
  await delay();
  return companyAdmins.filter((a) => a.companyId === companyId);
}

export async function addCompanyAdmin(input: AddCompanyAdminInput): Promise<CompanyAdminAccount> {
  await delay(400);
  const admin: CompanyAdminAccount = {
    id: `company-admin-${Date.now()}`,
    companyId: input.companyId,
    name: input.name,
    email: input.email,
    temporaryPassword: input.temporaryPassword,
    createdAt: new Date().toISOString(),
  };
  companyAdmins.push(admin);

  const company = companies.find((c) => c.id === input.companyId);
  recordSystemLog(
    'admin_created',
    `Company Admin "${admin.name}" was created for ${company?.name ?? 'Unknown Company'}.`,
    input.companyId,
  );
  persistAll();
  return admin;
}
