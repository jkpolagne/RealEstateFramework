import type { ConsultantLink } from '../types';
import { consultantLinks } from '../mocks/consultantLinks';
import { delay } from '../lib/delay';

export async function getConsultantLinkBySlug(slug: string): Promise<ConsultantLink | undefined> {
  await delay(150);
  return consultantLinks.find((link) => link.slug === slug && link.status === 'active');
}
