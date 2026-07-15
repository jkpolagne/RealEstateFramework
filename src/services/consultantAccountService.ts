import type { AddConsultantAccountInput, ConsultantAccount, ConsultantLink } from '../types';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { consultantLinks } from '../mocks/consultantLinks';
import { clients } from '../mocks/clients';
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

export interface UpdateConsultantAccountInput {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  assignedUnderId: string | null;
  status: 'active' | 'inactive';
}

/** Role is fixed at creation — changing it would require regenerating or retiring the consultant link, so edit never touches it. */
export async function updateConsultantAccount(id: string, input: UpdateConsultantAccountInput): Promise<ConsultantAccount> {
  await delay(400);
  const account = consultantAccounts.find((c) => c.id === id);
  if (!account) throw new Error('Consultant account not found');

  Object.assign(account, {
    firstName: input.firstName,
    middleName: input.middleName,
    lastName: input.lastName,
    email: input.email,
    contactNumber: input.contactNumber,
    assignedUnderId: account.role === 'Broker' ? null : input.assignedUnderId,
    status: input.status,
  });

  const link = consultantLinks.find((l) => l.consultantId === account.id);
  if (link) {
    link.consultantName = [account.firstName, account.middleName, account.lastName].filter(Boolean).join(' ');
    link.contactNumber = account.contactNumber;
    link.email = account.email;
    link.status = account.status;
  }

  return account;
}

export async function deleteConsultantAccount(id: string): Promise<void> {
  await delay(400);
  const clientCount = clients.filter((c) => c.brokerId === id || c.salesManagerId === id || c.salesPersonId === id).length;
  if (clientCount > 0) {
    throw new Error(
      `Cannot delete this consultant — ${clientCount} client${clientCount === 1 ? ' is' : 's are'} still assigned to them.`,
    );
  }

  const superviseeCount = consultantAccounts.filter((c) => c.assignedUnderId === id).length;
  if (superviseeCount > 0) {
    throw new Error(
      `Cannot delete this consultant — ${superviseeCount} team member${superviseeCount === 1 ? '' : 's'} report to them. Reassign them first.`,
    );
  }

  const index = consultantAccounts.findIndex((c) => c.id === id);
  if (index !== -1) consultantAccounts.splice(index, 1);

  const linkIndex = consultantLinks.findIndex((l) => l.consultantId === id);
  if (linkIndex !== -1) consultantLinks.splice(linkIndex, 1);
}
