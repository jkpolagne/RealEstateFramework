import type { ConsultantLink } from '../types';
import { consultantLinks } from '../mocks/consultantLinks';
import { delay } from '../lib/delay';

export async function getConsultantLinkBySlug(slug: string): Promise<ConsultantLink | undefined> {
  await delay(150);
  return consultantLinks.find((link) => link.slug === slug && link.status === 'active');
}

export async function getConsultantLinkById(id: string): Promise<ConsultantLink | undefined> {
  await delay(150);
  return consultantLinks.find((link) => link.id === id);
}

export async function getConsultantLinks(): Promise<ConsultantLink[]> {
  await delay();
  return consultantLinks;
}

export async function getConsultantLinkByConsultantId(consultantId: string): Promise<ConsultantLink | undefined> {
  await delay(150);
  return consultantLinks.find((link) => link.consultantId === consultantId);
}
