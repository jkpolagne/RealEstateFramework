import { useEffect, useState } from 'react';
import type { ConsultantLink } from '../../types';
import { getConsultantLinkByConsultantId } from '../../services/consultantLinkService';

interface ConsultantLinkCardProps {
  consultantId: string;
}

/** Quick-access referral link, shown on the Dashboard so a Sales Manager/Sales Person doesn't need a dedicated nav item for it. */
export function ConsultantLinkCard({ consultantId }: ConsultantLinkCardProps) {
  const [link, setLink] = useState<ConsultantLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getConsultantLinkByConsultantId(consultantId).then((result) => {
      setLink(result ?? null);
      setLoading(false);
    });
  }, [consultantId]);

  const fullLink = link ? `${window.location.origin}/?ref=${link.slug}` : '';

  async function handleCopy() {
    if (!fullLink) return;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser — the link is still visible on screen.
    }
  }

  if (loading || !link) return null;

  return (
    <div className="card admin-dashboard-panel consultant-link-panel">
      <div className="admin-dashboard-panel-header">
        <h3>Your referral link</h3>
      </div>
      <p className="text-muted">Share this link with prospects — visits and sales through it are tagged as Referred and credited to you.</p>
      <p className="consultant-link-url">{fullLink}</p>
      <button type="button" className="btn btn-primary btn-sm" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
