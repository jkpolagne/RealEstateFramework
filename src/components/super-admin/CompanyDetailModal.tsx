import type { Company, CompanyAdminAccount } from '../../types';

interface CompanyDetailModalProps {
  company: Company;
  admins: CompanyAdminAccount[];
  onClose: () => void;
}

export function CompanyDetailModal({ company, admins, onClose }: CompanyDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{company.name}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <dl className="quotation-breakdown admin-confirmation-details">
            <div>
              <dt>Code</dt>
              <dd>{company.code}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`badge ${company.status === 'active' ? 'badge-available' : 'badge-reserved'}`}>
                  {company.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{company.address}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{company.email}</dd>
            </div>
            <div>
              <dt>Contact number</dt>
              <dd>{company.contactNumber}</dd>
            </div>
            <div>
              <dt>Registered</dt>
              <dd>{new Date(company.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })}</dd>
            </div>
          </dl>

          <fieldset className="admin-fieldset">
            <legend>Company Admin accounts</legend>
            {admins.length === 0 ? (
              <p className="text-muted">No Company Admin has been created for this company yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="admin-table-name">{admin.name}</td>
                        <td className="text-muted">{admin.email}</td>
                        <td>{admin.temporaryPassword}</td>
                        <td className="text-muted">{new Date(admin.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
