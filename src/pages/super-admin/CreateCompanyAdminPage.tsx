import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AddCompanyAdminInput, Company, CompanyAdminAccount } from '../../types';
import { getCompanies } from '../../services/companyService';
import { addCompanyAdmin } from '../../services/companyAdminService';
import { generateTemporaryPassword } from '../../lib/generatePassword';

export function CreateCompanyAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState(generateTemporaryPassword());
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CompanyAdminAccount | null>(null);

  useEffect(() => {
    getCompanies().then((result) => {
      setCompanies(result);
      if (result.length > 0) setCompanyId(result[0].id);
    });
  }, []);

  function resetForm() {
    setName('');
    setEmail('');
    setTemporaryPassword(generateTemporaryPassword());
    setCreated(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const input: AddCompanyAdminInput = { companyId, name, email, temporaryPassword };
    const admin = await addCompanyAdmin(input);
    setSubmitting(false);
    setCreated(admin);
  }

  const createdCompany = created ? companies.find((c) => c.id === created.companyId) : null;

  if (created) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Create Company Admin</h1>
        </div>
        <div className="card admin-confirmation">
          <p className="admin-confirmation-title">Company Admin account created</p>
          <p className="text-muted">
            <strong>{created.name}</strong> was created for {createdCompany?.name ?? 'the selected company'}.
          </p>
          <dl className="quotation-breakdown admin-confirmation-details">
            <div>
              <dt>Email</dt>
              <dd>{created.email}</dd>
            </div>
            <div>
              <dt>Temporary password</dt>
              <dd>{created.temporaryPassword}</dd>
            </div>
          </dl>
          <div className="admin-confirmation-actions">
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Create Another
            </button>
            <Link to="/super-admin/companies" className="btn btn-primary">
              View Companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Create Company Admin</h1>
        <p className="text-muted">Grant a Company Admin account for one of the registered companies.</p>
      </div>

      <form className="admin-form card admin-form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="admin-company">Company</label>
          <select id="admin-company" required value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.code})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="admin-name">Admin name</label>
          <input id="admin-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Temporary password</label>
          <div className="field-row">
            <input
              id="admin-password"
              type="text"
              required
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setTemporaryPassword(generateTemporaryPassword())}
            >
              Generate
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !companyId}>
          {submitting ? 'Creating...' : 'Create Company Admin'}
        </button>
      </form>
    </div>
  );
}
