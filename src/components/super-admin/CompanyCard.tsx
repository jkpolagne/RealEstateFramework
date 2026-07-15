import type { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  adminCount: number;
  onToggleStatus: (company: Company) => void;
  toggling: boolean;
}

export function CompanyCard({ company, adminCount, onToggleStatus, toggling }: CompanyCardProps) {
  const isActive = company.status === 'active';

  return (
    <div className={`card company-card ${isActive ? 'card-accent-success' : 'card-accent-warning'}`}>
      <div className="company-card-top">
        <span className="company-card-code">{company.code}</span>
        <span className={`badge ${isActive ? 'badge-available' : 'badge-reserved'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <h3 className="company-card-name">{company.name}</h3>
      <p className="text-muted company-card-address">{company.address}</p>

      <dl className="company-card-meta">
        <div>
          <dt>Admins</dt>
          <dd>{adminCount}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{company.contactNumber}</dd>
        </div>
      </dl>
      <p className="text-muted company-card-email">{company.email}</p>

      <button
        type="button"
        className={`btn btn-sm btn-block ${isActive ? 'btn-outline' : 'btn-primary'}`}
        onClick={() => onToggleStatus(company)}
        disabled={toggling}
      >
        {toggling ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}
