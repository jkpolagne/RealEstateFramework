import { useEffect, useState } from 'react';
import type { AddConsultantAccountInput, ConsultantAccount, ConsultantRole } from '../../types';
import { addConsultantAccount, getConsultantAccountsByRole } from '../../services/consultantAccountService';

interface AddConsultantAccountFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const ROLES: ConsultantRole[] = ['Broker', 'Sales Manager', 'Sales Person'];

export function AddConsultantAccountForm({ onClose, onAdded }: AddConsultantAccountFormProps) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ConsultantRole>('Sales Person');
  const [assignedUnderId, setAssignedUnderId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [supervisors, setSupervisors] = useState<ConsultantAccount[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const supervisorRole: ConsultantRole | null = role === 'Sales Manager' ? 'Broker' : role === 'Sales Person' ? 'Sales Manager' : null;

  useEffect(() => {
    if (!supervisorRole) {
      setSupervisors([]);
      setAssignedUnderId('');
      return;
    }
    getConsultantAccountsByRole(supervisorRole).then((result) => {
      setSupervisors(result);
      setAssignedUnderId(result.length > 0 ? result[0].id : '');
    });
  }, [supervisorRole]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const input: AddConsultantAccountInput = {
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      password,
      role,
      assignedUnderId: supervisorRole ? assignedUnderId : null,
      status,
    };
    await addConsultantAccount(input);
    setSubmitting(false);
    onAdded();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Consultant Account</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <fieldset className="admin-fieldset">
              <legend>Personal information</legend>
              <div className="field-row field-row-3">
                <div className="field">
                  <label htmlFor="consultant-first">First name</label>
                  <input id="consultant-first" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="consultant-middle">Middle name</label>
                  <input id="consultant-middle" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="consultant-last">Last name</label>
                  <input id="consultant-last" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="consultant-email">Email</label>
                  <input id="consultant-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="consultant-contact">Contact number</label>
                  <input
                    id="consultant-contact"
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="consultant-password">Set password</label>
                <input
                  id="consultant-password"
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </fieldset>

            <div className="field-row">
              <div className="field">
                <label htmlFor="consultant-role">Role</label>
                <select id="consultant-role" value={role} onChange={(e) => setRole(e.target.value as ConsultantRole)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="consultant-status">Status</label>
                <select id="consultant-status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {supervisorRole && (
              <div className="field">
                <label htmlFor="consultant-assigned-under">Assign under ({supervisorRole})</label>
                <select
                  id="consultant-assigned-under"
                  required
                  value={assignedUnderId}
                  onChange={(e) => setAssignedUnderId(e.target.value)}
                >
                  {supervisors.length === 0 && <option value="">No {supervisorRole.toLowerCase()}s available</option>}
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {role !== 'Broker' && (
              <p className="text-muted admin-form-hint">
                A unique consultant link will be generated automatically for this account on save.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || (supervisorRole != null && !assignedUnderId)}
            >
              {submitting ? 'Adding...' : 'Add Consultant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
