import type { AddConsultantAccountInput, ConsultantAccount, ConsultantLink } from '../types';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { consultantLinks } from '../mocks/consultantLinks';
import { delay } from '../lib/delay';
import { uniqueSlug } from '../lib/slugify';

export async function getConsultantAccounts(): Promise<ConsultantAccount[]> {
  await delay();
  return consultantAccounts;
}

export async function getConsultantAccountsByRole(role: ConsultantAccount['role']): Promise<ConsultantAccount[]> {
  await delay();
  return consultantAccounts.filter((c) => c.role === role);
}

export async function addConsultantAccount(input: AddConsultantAccountInput): Promise<ConsultantAccount> {
  await delay(400);

  const account: ConsultantAccount = {
    id: `consultant-${Date.now()}`,
    firstName: input.firstName,
    middleName: input.middleName,
    lastName: input.lastName,
    email: input.email,
    contactNumber: input.contactNumber,
    role: input.role,
    assignedUnderId: input.role === 'Broker' ? null : input.assignedUnderId,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  consultantAccounts.push(account);

  if (account.role === 'Sales Manager' || account.role === 'Sales Person') {
    const fullName = [account.firstName, account.middleName, account.lastName].filter(Boolean).join(' ');
    const slug = uniqueSlug(fullName, consultantLinks.map((l) => l.slug));
    const link: ConsultantLink = {
      id: `link-${Date.now()}`,
      slug,
      consultantId: account.id,
      consultantName: fullName,
      role: account.role,
      contactNumber: account.contactNumber,
      email: account.email,
      status: account.status,
    };
    consultantLinks.push(link);
  }

  return account;
}
