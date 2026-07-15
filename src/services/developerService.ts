import type { Developer } from '../types';
import { developers } from '../mocks/developers';
import { delay } from '../lib/delay';

export async function getDevelopers(): Promise<Developer[]> {
  await delay();
  return developers.filter((d) => d.status === 'active');
}

export async function getDeveloperById(id: string): Promise<Developer | undefined> {
  await delay();
  return developers.find((d) => d.id === id);
}
