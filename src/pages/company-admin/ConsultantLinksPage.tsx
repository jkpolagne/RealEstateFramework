import { useEffect, useState } from 'react';
import type { ConsultantLink } from '../../types';
import { getConsultantLinks } from '../../services/consultantLinkService';

type RoleFilter = 'all' | 'Sales Manager' | 'Sales Person';
type StatusFilter = 'all' | 'active' | 'inactive';

export function ConsultantLinksPage() {
  const [links, setLinks] = useState<ConsultantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    getConsultantLinks().then((result) => {
      setLinks(result);
      setLoading(false);
    });
  }, []);

  function fullLink(slug: string): string {
    return `${window.location.origin}/?ref=${slug}`;
  }

  async function handleCopy(link: ConsultantLink) {
    try {
      await navigator.clipboard.writeText(fullLink(link.slug));
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 1500);
    } catch {
      // Clipboard access can be denied by the browser — the link is still visible in the table.
    }
  }

  const filtered = links.filter((link) => {
    if (roleFilter !== 'all' && link.role !== roleFilter) return false;
    if (statusFilter !== 'all' && link.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!link.consultantName.toLowerCase().includes(q) && !link.slug.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Consultant Links</h1>
        <p className="text-muted">Auto-generated referral links for Sales Managers and Sales Persons.</p>
      </div>

      <p className="text-muted admin-form-hint">
        Click a link below to try it — it opens the public site with that consultant's referral applied, so any Schedule Visit
        submitted from there is tagged as Referred and credited to them.
      </p>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by consultant or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}>
          <option value="all">All roles</option>
          <option value="Sales Manager">Sales Manager</option>
          <option value="Sales Person">Sales Person</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading consultant links...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Consultant</th>
                <th>Role</th>
                <th>Link</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted admin-table-empty">
                    No consultant links match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((link) => (
                  <tr key={link.id}>
                    <td className="admin-table-name">{link.consultantName}</td>
                    <td>{link.role}</td>
                    <td>
                      <a
                        className="consultant-link-preview"
                        href={fullLink(link.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fullLink(link.slug)}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${link.status === 'active' ? 'badge-available' : 'badge-reserved'}`}>
                        {link.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <a
                          className="btn btn-outline btn-sm"
                          href={fullLink(link.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </a>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCopy(link)}>
                          {copiedId === link.id ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
