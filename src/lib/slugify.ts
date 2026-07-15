export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(name: string, existingSlugs: string[]): string {
  const base = slugify(name);
  if (!existingSlugs.includes(base)) return base;
  let suffix = 2;
  while (existingSlugs.includes(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}
