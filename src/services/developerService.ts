import type { AddDeveloperInput, Developer } from '../types';
import { developers } from '../mocks/developers';
import { properties } from '../mocks/properties';
import { delay } from '../lib/delay';

export async function getDevelopers(): Promise<Developer[]> {
  await delay();
  return developers.filter((d) => d.status === 'active');
}

/** Company Admin sees every developer regardless of status. */
export async function getAllDevelopers(): Promise<Developer[]> {
  await delay();
  return developers;
}

export async function getDeveloperById(id: string): Promise<Developer | undefined> {
  await delay();
  return developers.find((d) => d.id === id);
}

export async function addDeveloper(input: AddDeveloperInput): Promise<Developer> {
  await delay(400);
  const developer: Developer = { id: `dev-${Date.now()}`, ...input };
  developers.push(developer);
  return developer;
}

export async function updateDeveloper(id: string, input: AddDeveloperInput): Promise<Developer> {
  await delay(400);
  const developer = developers.find((d) => d.id === id);
  if (!developer) throw new Error('Developer not found');
  Object.assign(developer, input);
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
}
