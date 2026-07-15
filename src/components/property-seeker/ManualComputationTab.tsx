import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../../services/propertyService';
import { computeBudgetLoan, type BudgetLoanResult } from '../../services/loanService';
import { formatPHP } from '../../lib/format';
import { StatTile } from '../shared/StatTile';
import { StatusBadge } from './StatusBadge';

const BUDGET_PRESETS = [8000, 12000, 18000, 23000, 35000];

export function ManualComputationTab() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [termYears, setTermYears] = useState('20');
  const [interestRate, setInterestRate] = useState('6.5');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetLoanResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const monthlyBudget = Number(budget);
    if (!budget || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
      setError('Please enter a valid monthly budget.');
      setResult(null);
      return;
    }
    setError(null);
    setLoading(true);
    const allProperties = await getProperties();
    const computed = await computeBudgetLoan(
      {
        monthlyBudget,
        downPaymentPercent: Number(downPaymentPercent) || 0,
        termMonths: (Number(termYears) || 1) * 12,
        interestRate: Number(interestRate) || 0,
      },
      allProperties,
    );
    setResult(computed);
    setLoading(false);
  }

  return (
    <div className="loanpage-panel">
      <div className="card loanpage-form-card">
        <h3>Enter Your Monthly Budget</h3>
        <p className="text-muted">We will calculate the maximum loan you qualify for and show matching properties.</p>

        <form onSubmit={handleSubmit} className="loanpage-form">
          <div className="field">
            <label htmlFor="manual-budget">Monthly budget (₱)</label>
            <input
              id="manual-budget"
              type="number"
              min={0}
              placeholder="e.g. 35000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="loanpage-terms-row">
            <div className="field">
              <label htmlFor="manual-dp">Down payment</label>
              <div className="loanpage-unit-input">
                <input
                  id="manual-dp"
                  type="number"
                  min={0}
                  max={100}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(e.target.value)}
                />
                <span>%</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="manual-term">Term</label>
              <div className="loanpage-unit-input">
                <input
                  id="manual-term"
                  type="number"
                  min={1}
                  max={30}
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                />
                <span>yrs</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="manual-rate">Rate</label>
              <div className="loanpage-unit-input">
                <input
                  id="manual-rate"
                  type="number"
                  min={0}
                  max={30}
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
                <span>%</span>
              </div>
            </div>
          </div>

          <div className="filter-chip-row">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`filter-chip${budget === String(preset) ? ' filter-chip-active' : ''}`}
                onClick={() => setBudget(String(preset))}
              >
                {formatPHP(preset)}
              </button>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Computing...' : 'Compute Loan Estimate'}
          </button>
        </form>
      </div>

      {result && (
        <>
          <div className="stat-tile-row">
            <StatTile label="Your Monthly Budget" value={formatPHP(result.monthlyBudget)} hint="per month" fill />
            <StatTile label="Estimated Max Loan" value={formatPHP(result.maxPropertyPrice)} hint={`over ${termYears} years`} />
            <StatTile label="Matching Properties" value={String(result.matchingProperties.length)} hint="within your budget" />
          </div>

          <div className="loanpage-suggested">
            <h3>Suggested Properties ({result.matchingProperties.length} found)</h3>
            {result.matchingProperties.length === 0 ? (
              <p className="text-muted">No available properties fit this budget yet.</p>
            ) : (
              <div className="loanpage-property-grid">
                {result.matchingProperties.map(({ property, estimatedMonthlyPayment }) => (
                  <div key={property.id} className="loanpage-property-row">
                    <img src={property.heroImage} alt={property.name} />
                    <div className="loanpage-property-info">
                      <div className="loanpage-property-top">
                        <p className="loanpage-property-name">{property.name}</p>
                        <StatusBadge status={property.status} />
                      </div>
                      <p className="text-muted loanpage-property-meta">
                        {property.location.address} · {property.type}
                        {property.floorArea > 0 ? ` · ${property.floorArea}m² floor` : ''}
                      </p>
                      <p className="price">{formatPHP(property.price)}</p>
                      <p className="text-muted loanpage-property-payment">
                        Est. monthly payment {formatPHP(estimatedMonthlyPayment)}/mo
                      </p>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate(`/property/${property.id}`)}>
                      Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
