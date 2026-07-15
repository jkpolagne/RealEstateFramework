import { useEffect, useState } from 'react';
import type { AddConsultantAccountInput, ConsultantAccount, ConsultantRole } from '../../types';
import { addConsultantAccount, getConsultantAccountsByRole, updateConsultantAccount } from '../../services/consultantAccountService';

interface ConsultantAccountFormProps {
  account?: ConsultantAccount;
  onClose: () => void;
  onSaved: () => void;
}

const ROLES: ConsultantRole[] = ['Broker', 'Sales Manager', 'Sales Person'];

export function ConsultantAccountForm({ account, onClose, onSaved }: ConsultantAccountFormProps) {
  const isEdit = Boolean(account);
  const [firstName, setFirstName] = useState(account?.firstName ?? '');
  const [middleName, setMiddleName] = useState(account?.middleName ?? '');
  const [lastName, setLastName] = useState(account?.lastName ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [contactNumber, setContactNumber] = useState(account?.contactNumber ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ConsultantRole>(account?.role ?? 'Sales Person');
  const [assignedUnderId, setAssignedUnderId] = useState(account?.assignedUnderId ?? '');
  const [status, setStatus] = useState<'active' | 'inactive'>(account?.status ?? 'active');
  const [supervisors, setSupervisors] = useState<ConsultantAccount[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supervisorRole: ConsultantRole | null = role === 'Sales Manager' ? 'Broker' : role === 'Sales Person' ? 'Sales Manager' : null;

  useEffect(() => {
    if (!supervisorRole) {
      setSupervisors([]);
      setAssignedUnderId('');
      return;
    }
    getConsultantAccountsByRole(supervisorRole).then((result) => {
      setSupervisors(result);
      if (!isEdit) setAssignedUnderId(result.length > 0 ? result[0].id : '');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supervisorRole]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && account) {
        await updateConsultantAccount(account.id, {
          firstName,
          middleName,
          lastName,
          email,
          contactNumber,
          assignedUnderId: supervisorRole ? assignedUnderId : null,
          status,
        });
      } else {
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
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Consultant Account' : 'Add Consultant Account'}</h2>
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
                    type="tel"
                    required
                    pattern="[0-9+()\-\s]{7,}"
                    title="Enter a valid phone number (digits, spaces, +, -, or parentheses)."
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>
              {!isEdit && (
                <div className="field">
                  <label htmlFor="consultant-password">Set password</label>
                  <input
                    id="consultant-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-muted field-help">At least 8 characters.</p>
                </div>
              )}
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Role &amp; assignment</legend>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="consultant-role">Role</label>
                  <select
                    id="consultant-role"
                    value={role}
                    disabled={isEdit}
                    onChange={(e) => setRole(e.target.value as ConsultantRole)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {isEdit && <p className="text-muted field-help">Role can't be changed after the account is created.</p>}
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
                    {supervisors.length === 0 && !assignedUnderId && (
                      <option value="">No {supervisorRole.toLowerCase()}s available</option>
                    )}
                    {isEdit && assignedUnderId && !supervisors.some((s) => s.id === assignedUnderId) && (
                      <option value={assignedUnderId}>Loading...</option>
                    )}
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isEdit && role !== 'Broker' && (
                <p className="text-muted field-help">A unique consultant link will be generated automatically for this account on save.</p>
              )}
            </fieldset>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || (supervisorRole != null && !assignedUnderId)}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Consultant'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
