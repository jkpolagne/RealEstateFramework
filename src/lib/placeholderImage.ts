const GRADIENTS: [string, string][] = [
  ['#132135', '#1c2f4a'],
  ['#B8863B', '#96692B'],
  ['#1c2f4a', '#B8863B'],
  ['#0e1a2b', '#2a4468'],
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic offline placeholder image (SVG data URI) — no network dependency. */
export function placeholderImage(seed: string, label: string, w = 800, h = 600): string {
  const idx = hashSeed(seed) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <g opacity="0.15">
      <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${h * 0.35}" fill="#ffffff"/>
      <circle cx="${w * 0.1}" cy="${h * 0.9}" r="${h * 0.25}" fill="#ffffff"/>
    </g>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      font-family="Inter, sans-serif" font-size="${Math.round(h * 0.055)}" font-weight="700"
      fill="#ffffff" opacity="0.92">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
