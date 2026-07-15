import { useEffect, useState } from 'react';
import type { ConsultantLink } from '../../types';
import { getConsultantLinkByConsultantId } from '../../services/consultantLinkService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

export function ConsultantLinkPage() {
  const { consultantId } = useConsultantSession();
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

  return (
    <div>
      <div className="admin-page-header">
        <h1>Consultant Link</h1>
        <p className="text-muted">
          Share this link with prospects — visits and sales through it are tagged as Referred and credited to you.
        </p>
      </div>

      {loading ? (
        <p className="text-muted">Loading your link...</p>
      ) : !link ? (
        <p className="text-muted">No consultant link found for your account.</p>
      ) : (
        <div className="card consultant-link-card">
          <p className="text-muted">Your referral link</p>
          <p className="consultant-link-url">{fullLink}</p>
          <button type="button" className="btn btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
