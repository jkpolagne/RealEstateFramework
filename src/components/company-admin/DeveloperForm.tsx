import { useState } from 'react';
import type { AddDeveloperInput, Developer } from '../../types';
import { addDeveloper, updateDeveloper } from '../../services/developerService';
import { useAuth } from '../../context/AuthContext';

interface DeveloperFormProps {
  developer?: Developer;
  onClose: () => void;
  onSaved: () => void;
}

export function DeveloperForm({ developer, onClose, onSaved }: DeveloperFormProps) {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const isEdit = Boolean(developer);
  const [name, setName] = useState(developer?.name ?? '');
  const [totalCutPercent, setTotalCutPercent] = useState(String(developer?.totalCutPercent ?? 6));
  const [status, setStatus] = useState<'active' | 'inactive'>(developer?.status ?? 'active');
  const [directBroker, setDirectBroker] = useState(String(developer?.directSale.brokerPercent ?? 2));
  const [directSalesManager, setDirectSalesManager] = useState(String(developer?.directSale.salesManagerPercent ?? 4));
  const [referredBroker, setReferredBroker] = useState(String(developer?.referredSale.brokerPercent ?? 2));
  const [referredSalesManager, setReferredSalesManager] = useState(String(developer?.referredSale.salesManagerPercent ?? 1.5));
  const [referredSalesPerson, setReferredSalesPerson] = useState(String(developer?.referredSale.salesPersonPercent ?? 2.5));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCut = Number(totalCutPercent) || 0;
  const directTotal = (Number(directBroker) || 0) + (Number(directSalesManager) || 0);
  const referredTotal = (Number(referredBroker) || 0) + (Number(referredSalesManager) || 0) + (Number(referredSalesPerson) || 0);
  const directExceeds = directTotal > totalCut;
  const referredExceeds = referredTotal > totalCut;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (directExceeds) {
      setError(`Direct Sale split (${directTotal}%) exceeds the total developer cut (${totalCut}%). Reduce the Broker/Sales Manager rates or raise the total cut.`);
      return;
    }
    if (referredExceeds) {
      setError(`Referred Sale split (${referredTotal}%) exceeds the total developer cut (${totalCut}%). Reduce the Broker/Sales Manager/Sales Person rates or raise the total cut.`);
      return;
    }

    setSubmitting(true);
    const input: AddDeveloperInput = {
      companyId,
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
    try {
      if (isEdit && developer) {
        await updateDeveloper(developer.id, input);
      } else {
        await addDeveloper(input);
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
          <h2>{isEdit ? 'Edit Developer' : 'Add Developer'}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <fieldset className="admin-fieldset">
              <legend>Basic information</legend>
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
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Direct Sale rates (%)</legend>
              <p className="text-muted field-help">Applies when a Property Seeker buys without going through a consultant link.</p>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="direct-broker">Broker</label>
                  <input
                    id="direct-broker"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    required
                    aria-invalid={directExceeds}
                    aria-describedby={directExceeds ? 'direct-sale-total' : undefined}
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
                    max={100}
                    step="0.1"
                    required
                    aria-invalid={directExceeds}
                    aria-describedby={directExceeds ? 'direct-sale-total' : undefined}
                    value={directSalesManager}
                    onChange={(e) => setDirectSalesManager(e.target.value)}
                  />
                </div>
              </div>
              <p id="direct-sale-total" className={`field-help ${directExceeds ? 'field-help-danger' : 'text-muted'}`}>
                Direct Sale total: {directTotal}% of {totalCut}% cut
                {directExceeds ? ' — exceeds the total developer cut.' : ''}
              </p>
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Referred Sale rates (%)</legend>
              <p className="text-muted field-help">Applies when the buyer arrived through a Sales Person's consultant link.</p>
              <div className="field-row field-row-3">
                <div className="field">
                  <label htmlFor="referred-broker">Broker</label>
                  <input
                    id="referred-broker"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    required
                    aria-invalid={referredExceeds}
                    aria-describedby={referredExceeds ? 'referred-sale-total' : undefined}
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
                    max={100}
                    step="0.1"
                    required
                    aria-invalid={referredExceeds}
                    aria-describedby={referredExceeds ? 'referred-sale-total' : undefined}
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
                    max={100}
                    step="0.1"
                    required
                    aria-invalid={referredExceeds}
                    aria-describedby={referredExceeds ? 'referred-sale-total' : undefined}
                    value={referredSalesPerson}
                    onChange={(e) => setReferredSalesPerson(e.target.value)}
                  />
                </div>
              </div>
              <p id="referred-sale-total" className={`field-help ${referredExceeds ? 'field-help-danger' : 'text-muted'}`}>
                Referred Sale total: {referredTotal}% of {totalCut}% cut
                {referredExceeds ? ' — exceeds the total developer cut.' : ''}
              </p>
            </fieldset>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || directExceeds || referredExceeds}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Developer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
