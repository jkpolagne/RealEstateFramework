import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Developer, LoanQuotation, Property } from '../../types';
import { formatPHP } from '../../lib/format';
import { getDevelopers } from '../../services/developerService';
import { getProperties } from '../../services/propertyService';
import { computeManualLoan, getLoanQuotationByProperty, type ManualLoanResult } from '../../services/loanService';

type Tab = 'manual' | 'fixed';

interface LoanCalculatorModalProps {
  onClose: () => void;
}

export function LoanCalculatorModal({ onClose }: LoanCalculatorModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('manual');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal loan-calculator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Loan Calculator</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab${tab === 'manual' ? ' tab-active' : ''}`}
            onClick={() => setTab('manual')}
          >
            Manual
          </button>
          <button
            type="button"
            className={`tab${tab === 'fixed' ? ' tab-active' : ''}`}
            onClick={() => setTab('fixed')}
          >
            Fixed Quotation
          </button>
        </div>

        <div className="modal-body scroll-y">
          {tab === 'manual' ? (
            <ManualTab onViewDetails={(id) => { onClose(); navigate(`/property/${id}`); }} />
          ) : (
            <FixedQuotationTab onViewProperty={(id) => { onClose(); navigate(`/property/${id}`); }} />
          )}
        </div>
      </div>
    </div>
  );
}

function ManualTab({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ManualLoanResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const totalBudget = Number(budget);
    if (!totalBudget || totalBudget <= 0) return;
    setLoading(true);
    const allProperties = await getProperties();
    const computed = await computeManualLoan(totalBudget, allProperties);
    setResult(computed);
    setLoading(false);
  }

  return (
    <div>
      <form className="field" onSubmit={handleSubmit}>
        <label htmlFor="manual-budget">Your total budget (₱)</label>
        <div className="field-row">
          <input
            id="manual-budget"
            type="number"
            min={0}
            placeholder="e.g. 2000000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Computing...' : 'Compute'}
          </button>
        </div>
      </form>

      {result && (
        <div className="loan-result">
          <div className="loan-result-summary">
            <div>
              <p className="text-muted">Estimated monthly budget</p>
              <p className="price price-lg">{formatPHP(result.monthlyBudget)}</p>
            </div>
            <div>
              <p className="text-muted">Max affordable price</p>
              <p className="price price-lg">{formatPHP(result.maxAffordablePrice)}</p>
            </div>
          </div>

          <h4 className="loan-result-heading">Matching properties</h4>
          {result.matchingProperties.length === 0 ? (
            <p className="text-muted">No available properties fit this budget yet.</p>
          ) : (
            <div className="loan-property-list">
              {result.matchingProperties.map((property) => (
                <div key={property.id} className="loan-property-row">
                  <img src={property.heroImage} alt={property.name} />
                  <div className="loan-property-info">
                    <p className="loan-property-name">{property.name}</p>
                    <p className="text-muted">{property.type}</p>
                    <p className="price">{formatPHP(property.price)}</p>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onViewDetails(property.id)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FixedQuotationTab({ onViewProperty }: { onViewProperty: (id: string) => void }) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [developerId, setDeveloperId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [quotation, setQuotation] = useState<LoanQuotation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDevelopers().then(setDevelopers);
    getProperties().then(setProperties);
  }, []);

  const propertiesForDeveloper = properties.filter((p) => p.developerId === developerId);
  const selectedProperty = properties.find((p) => p.id === propertyId) ?? null;

  useEffect(() => {
    if (!propertyId) {
      setQuotation(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getLoanQuotationByProperty(propertyId).then((q) => {
      if (!cancelled) {
        setQuotation(q ?? null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  return (
    <div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="fixed-developer">Developer</label>
          <select
            id="fixed-developer"
            value={developerId}
            onChange={(e) => {
              setDeveloperId(e.target.value);
              setPropertyId('');
            }}
          >
            <option value="">Select a developer</option>
            {developers.map((developer) => (
              <option key={developer.id} value={developer.id}>
                {developer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fixed-property">Property</label>
          <select
            id="fixed-property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            disabled={!developerId}
          >
            <option value="">Select a property</option>
            {propertiesForDeveloper.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-muted">Loading quotation...</p>}

      {!loading && propertyId && !quotation && (
        <p className="text-muted">No loan quotation is available for this property yet.</p>
      )}

      {!loading && quotation && selectedProperty && (
        <div className="loan-result">
          <div className="quotation-header">
            <img src={selectedProperty.heroImage} alt={selectedProperty.name} />
            <div>
              <p className="loan-property-name">{selectedProperty.name}</p>
              <p className="price price-lg">{formatPHP(quotation.propertyPrice)}</p>
            </div>
          </div>

          <dl className="quotation-breakdown">
            <div>
              <dt>Down payment</dt>
              <dd>{formatPHP(quotation.downPaymentAmount)} ({quotation.downPaymentPercent}%)</dd>
            </div>
            <div>
              <dt>Net loan amount</dt>
              <dd>{formatPHP(quotation.netLoanAmount)}</dd>
            </div>
            <div>
              <dt>Interest rate</dt>
              <dd>{quotation.interestRate}% p.a.</dd>
            </div>
            <div>
              <dt>Loan term</dt>
              <dd>{quotation.termMonths} months</dd>
            </div>
            <div>
              <dt>Monthly amortization</dt>
              <dd>{formatPHP(quotation.monthlyAmortization)}</dd>
            </div>
            <div>
              <dt>Total interest paid</dt>
              <dd>{formatPHP(quotation.totalInterestPaid)}</dd>
            </div>
            <div>
              <dt>Total amount payable</dt>
              <dd>{formatPHP(quotation.totalAmountPayable)}</dd>
            </div>
            <div>
              <dt>Principal</dt>
              <dd>{formatPHP(quotation.principal)}</dd>
            </div>
          </dl>
          <p className="text-muted">{quotation.paymentBreakdownDescription}</p>

          <button type="button" className="btn btn-primary btn-block" onClick={() => onViewProperty(selectedProperty.id)}>
            View Property
          </button>
        </div>
      )}
    </div>
  );
}
