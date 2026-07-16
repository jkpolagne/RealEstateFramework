import { useState } from 'react';
import type { Client, EmploymentStatus, PaymentMethod } from '../../types';
import { setUpClient } from '../../services/clientService';
import { formatPHP } from '../../lib/format';

interface SetUpClientModalProps {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'In-House', 'Bank Financing'];
const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['Locally Employed', 'OFW', 'Self-Employed'];

export function SetUpClientModal({ client, onClose, onSaved }: SetUpClientModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Locally Employed');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await setUpClient({
      clientId: client.id,
      paymentMethod,
      employmentStatus: paymentMethod === 'Bank Financing' ? employmentStatus : null,
    });
    setSubmitting(false);
    onSaved();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Set Up Client — {client.fullName}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <p className="text-muted">
            {client.saleType} sale · {formatPHP(client.salePrice)}
          </p>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="setup-payment-method">Payment method</label>
              <select
                id="setup-payment-method"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {paymentMethod === 'Bank Financing' && (
              <div className="field">
                <label htmlFor="setup-employment-status">Employment status</label>
                <select
                  id="setup-employment-status"
                  required
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                >
                  {EMPLOYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className="text-muted field-help">Determines which documents are required on the checklist.</p>
              </div>
            )}

            <p className="text-muted field-help">
              This builds the client's requirements checklist and starts milestone tracking.
            </p>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Saving...' : 'Set Up Client'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
