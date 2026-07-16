import type { AddDeveloperInput, Developer } from '../types';
import { developers } from '../mocks/developers';
import { properties } from '../mocks/properties';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';

/** Omit companyId for the public Property Seeker flow (browses every company's developers); pass it to scope to one company. */
export async function getDevelopers(companyId?: string): Promise<Developer[]> {
  await delay();
  return developers.filter((d) => d.status === 'active' && (!companyId || d.companyId === companyId));
}

/** Company Admin / Broker sees every developer for their own company regardless of status. */
export async function getAllDevelopers(companyId: string): Promise<Developer[]> {
  await delay();
  return developers.filter((d) => d.companyId === companyId);
}

export async function getDeveloperById(id: string): Promise<Developer | undefined> {
  await delay();
  return developers.find((d) => d.id === id);
}

export async function addDeveloper(input: AddDeveloperInput): Promise<Developer> {
  await delay(400);
  const developer: Developer = { id: `dev-${Date.now()}`, ...input };
  developers.push(developer);
  persistAll();
  return developer;
}

export async function updateDeveloper(id: string, input: AddDeveloperInput): Promise<Developer> {
  await delay(400);
  const developer = developers.find((d) => d.id === id);
  if (!developer) throw new Error('Developer not found');
  Object.assign(developer, input);
  persistAll();
  return developer;
}

export async function deleteDeveloper(id: string): Promise<void> {
  await delay(400);
  const propertyCount = properties.filter((p) => p.developerId === id).length;
  if (propertyCount > 0) {
    throw new Error(
      `Cannot delete this developer — ${propertyCount} propert${propertyCount === 1 ? 'y is' : 'ies are'} still linked to it. Remove or reassign ${propertyCount === 1 ? 'it' : 'them'} first.`,
    );
  }
  const index = developers.findIndex((d) => d.id === id);
  if (index !== -1) developers.splice(index, 1);
  persistAll();
}
