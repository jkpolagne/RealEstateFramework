/** Placeholder proof-of-payment thumbnail used by seed data — real uploads replace this with the consultant's photo. */
export const PLACEHOLDER_PROOF_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320">
      <rect width="240" height="320" fill="#FAF9F6"/>
      <rect x="16" y="16" width="208" height="288" fill="#FFFFFF" stroke="#E4E1D9" stroke-width="2"/>
      <text x="120" y="60" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#132135">OFFICIAL RECEIPT</text>
      <line x1="32" y1="80" x2="208" y2="80" stroke="#E4E1D9" stroke-dasharray="4 4"/>
      <line x1="32" y1="120" x2="208" y2="120" stroke="#E4E1D9"/>
      <line x1="32" y1="150" x2="208" y2="150" stroke="#E4E1D9"/>
      <line x1="32" y1="180" x2="208" y2="180" stroke="#E4E1D9"/>
      <line x1="32" y1="210" x2="150" y2="210" stroke="#E4E1D9"/>
      <text x="120" y="270" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5B6473">Sample proof of payment</text>
    </svg>`,
  );
