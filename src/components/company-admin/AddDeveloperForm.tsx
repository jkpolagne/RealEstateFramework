import { useState } from 'react';
import type { AddDeveloperInput } from '../../types';
import { addDeveloper } from '../../services/developerService';

interface AddDeveloperFormProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddDeveloperForm({ onClose, onAdded }: AddDeveloperFormProps) {
  const [name, setName] = useState('');
  const [totalCutPercent, setTotalCutPercent] = useState('6');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [directBroker, setDirectBroker] = useState('2');
  const [directSalesManager, setDirectSalesManager] = useState('4');
  const [referredBroker, setReferredBroker] = useState('2');
  const [referredSalesManager, setReferredSalesManager] = useState('1.5');
  const [referredSalesPerson, setReferredSalesPerson] = useState('2.5');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const input: AddDeveloperInput = {
      name,
      totalCutPercent: Number(totalCutPercent),
      status,
      directSale: {
        brokerPercent: Number(directBroker),
        salesManagerPercent: Number(directSalesManager),
      },
      referredSale: {
        brokerPercent: Number(referredBroker),
        salesManagerPercent: Number(referredSalesManager),
        salesPersonPercent: Number(referredSalesPerson),
      },
    };
    await addDeveloper(input);
    setSubmitting(false);
    onAdded();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Developer</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="dev-name">Developer name</label>
              <input id="dev-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="dev-cut">Total developer cut (%)</label>
                <input
                  id="dev-cut"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  required
                  value={totalCutPercent}
                  onChange={(e) => setTotalCutPercent(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="dev-status">Status</label>
                <select id="dev-status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <fieldset className="admin-fieldset">
              <legend>Direct Sale rates (%)</legend>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="direct-broker">Broker</label>
                  <input
                    id="direct-broker"
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    value={directBroker}
                    onChange={(e) => setDirectBroker(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="direct-sm">Sales Manager</label>
                  <input
                    id="direct-sm"
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    value={directSalesManager}
                    onChange={(e) => setDirectSalesManager(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Referred Sale rates (%)</legend>
              <div className="field-row field-row-3">
                <div className="field">
                  <label htmlFor="referred-broker">Broker</label>
                  <input
                    id="referred-broker"
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    value={referredBroker}
                    onChange={(e) => setReferredBroker(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="referred-sm">Sales Manager</label>
                  <input
                    id="referred-sm"
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    value={referredSalesManager}
                    onChange={(e) => setReferredSalesManager(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="referred-sp">Sales Person</label>
                  <input
                    id="referred-sp"
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    value={referredSalesPerson}
                    onChange={(e) => setReferredSalesPerson(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Developer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
