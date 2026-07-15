import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AddCompanyInput, Company } from '../../types';
import { addCompany } from '../../services/companyService';

export function CreateCompanyPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Company | null>(null);

  function resetForm() {
    setName('');
    setAddress('');
    setEmail('');
    setContactNumber('');
    setStatus('active');
    setCreated(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const input: AddCompanyInput = { name, address, email, contactNumber, status };
    const company = await addCompany(input);
    setSubmitting(false);
    setCreated(company);
  }

  if (created) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Create Company</h1>
        </div>
        <div className="card admin-confirmation">
          <p className="admin-confirmation-title">Company registered successfully</p>
          <p className="text-muted">
            <strong>{created.name}</strong> ({created.code}) has been added to the platform.
          </p>
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
        <h1>Create Company</h1>
        <p className="text-muted">Register a new company account on the platform.</p>
      </div>

      <form className="admin-form card admin-form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="company-name">Company name</label>
          <input id="company-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="company-address">Address</label>
          <input
            id="company-address"
            type="text"
            required
            placeholder="e.g. Naga City, Camarines Sur"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="company-email">Email</label>
            <input id="company-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="company-contact">Contact number</label>
            <input
              id="company-contact"
              type="text"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="company-status">Status</label>
          <select id="company-status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Company'}
        </button>
      </form>
    </div>
  );
}
