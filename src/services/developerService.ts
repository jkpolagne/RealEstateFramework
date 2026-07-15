import type { AddDeveloperInput, Developer } from '../types';
import { developers } from '../mocks/developers';
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
