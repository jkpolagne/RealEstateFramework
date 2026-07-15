import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Developer, LoanQuotation, Property } from '../../types';
import { getDevelopers } from '../../services/developerService';
import { getProperties } from '../../services/propertyService';
import { getLoanQuotationByProperty } from '../../services/loanService';
import { formatPHP, formatSqm } from '../../lib/format';
import { StatusBadge } from './StatusBadge';

export function FixedQuotationTab() {
  const navigate = useNavigate();
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

  const termYears = quotation ? Math.round(quotation.termMonths / 12) : 0;
  const principalPercent = quotation ? Math.round((quotation.netLoanAmount / quotation.totalAmountPayable) * 100) : 0;

  return (
    <div className="loanpage-panel">
      <div className="card loanpage-form-card">
        <h3>Select Developer &amp; Property</h3>
        <p className="text-muted">
          Choose a developer and property. The system will retrieve the available fixed loan quotation for the selected property.
        </p>

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

        {!loading && quotation && (
          <div className="loanpage-banner-success">
            <span className="loanpage-banner-icon">✓</span>
            <div>
              <p className="loanpage-banner-title">Fixed Loan Quotation Retrieved</p>
              <p className="text-muted">
                Pre-approved terms: {quotation.downPaymentPercent}% down payment · {termYears}-year term · {quotation.interestRate}% p.a.
              </p>
            </div>
          </div>
        )}
      </div>

      {!loading && quotation && selectedProperty && (
        <>
          <div className="card loanpage-property-summary">
            <img src={selectedProperty.heroImage} alt={selectedProperty.name} />
            <div className="loanpage-property-summary-body">
              <div className="loanpage-property-summary-top">
                <div>
                  <p className="loanpage-property-name">{selectedProperty.name}</p>
                  <p className="text-muted">{selectedProperty.developerName}</p>
                </div>
                <StatusBadge status={selectedProperty.status} />
              </div>
              <p className="text-muted">{selectedProperty.location.address}</p>
              <div className="loanpage-mini-stats">
                <div>
                  <span className="text-muted">Type</span>
                  <strong>{selectedProperty.type}</strong>
                </div>
                {selectedProperty.floorArea > 0 && (
                  <div>
                    <span className="text-muted">Floor Area</span>
                    <strong>{formatSqm(selectedProperty.floorArea)}</strong>
                  </div>
                )}
                <div>
                  <span className="text-muted">Lot Area</span>
                  <strong>{formatSqm(selectedProperty.lotArea)}</strong>
                </div>
                {selectedProperty.bedrooms > 0 && (
                  <div>
                    <span className="text-muted">Beds / Baths</span>
                    <strong>
                      {selectedProperty.bedrooms} / {selectedProperty.bathrooms}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card loanpage-quotation-card">
            <div className="loanpage-quotation-header">
              <div>
                <h3>Fixed Loan Quotation</h3>
                <p>
                  {selectedProperty.name} · {selectedProperty.developerName}
                </p>
              </div>
              <span className="badge badge-neutral loanpage-rate-badge">Standard Rate</span>
            </div>

            <div className="loanpage-quotation-body">
              <div className="loanpage-quote-stats">
                <div className="loanpage-quote-stat">
                  <span className="text-muted">Property Price</span>
                  <strong>{formatPHP(quotation.propertyPrice)}</strong>
                </div>
                <div className="loanpage-quote-stat">
                  <span className="text-muted">Down Payment</span>
                  <strong>
                    {formatPHP(quotation.downPaymentAmount)} ({quotation.downPaymentPercent}%)
                  </strong>
                </div>
                <div className="loanpage-quote-stat">
                  <span className="text-muted">Loan Amount</span>
                  <strong>{formatPHP(quotation.netLoanAmount)}</strong>
                </div>
                <div className="loanpage-quote-stat">
                  <span className="text-muted">Monthly Payment</span>
                  <strong>{formatPHP(quotation.monthlyAmortization)}</strong>
                </div>
              </div>

              <h4 className="loanpage-breakdown-title">Payment Breakdown</h4>
              <div className="loanpage-breakdown">
                <div className="loanpage-breakdown-row">
                  <span>Property Price</span>
                  <strong>{formatPHP(quotation.propertyPrice)}</strong>
                </div>
                <div className="loanpage-breakdown-row">
                  <span>Down Payment</span>
                  <strong>
                    {formatPHP(quotation.downPaymentAmount)} ({quotation.downPaymentPercent}% of price)
                  </strong>
                </div>
                <div className="loanpage-breakdown-row">
                  <span>Net Loan Amount</span>
                  <strong>{formatPHP(quotation.netLoanAmount)}</strong>
                </div>
                <div className="loanpage-breakdown-row">
                  <span>Interest Rate</span>
                  <strong>{quotation.interestRate}% per annum (fixed)</strong>
                </div>
                <div className="loanpage-breakdown-row">
                  <span>Loan Term</span>
                  <strong>
                    {termYears} years ({quotation.termMonths} months)
                  </strong>
                </div>
                <div className="loanpage-breakdown-row loanpage-breakdown-row-strong">
                  <span>Monthly Amortization</span>
                  <strong>{formatPHP(quotation.monthlyAmortization)}</strong>
                </div>
                <div className="loanpage-breakdown-row">
                  <span>Total Interest Paid</span>
                  <strong>{formatPHP(quotation.totalInterestPaid)}</strong>
                </div>
                <div className="loanpage-breakdown-row loanpage-breakdown-row-strong">
                  <span>Total Amount Payable</span>
                  <strong>{formatPHP(quotation.totalAmountPayable)}</strong>
                </div>
              </div>

              <div className="loanpage-ratio">
                <div className="loanpage-ratio-labels">
                  <span>Principal: {principalPercent}%</span>
                  <span>Interest: {100 - principalPercent}%</span>
                </div>
                <div className="loanpage-ratio-bar">
                  <div className="loanpage-ratio-bar-fill" style={{ width: `${principalPercent}%` }} />
                </div>
                <div className="loanpage-ratio-legend">
                  <span>
                    <i className="loanpage-dot loanpage-dot-principal" /> Principal
                  </span>
                  <span>
                    <i className="loanpage-dot loanpage-dot-interest" /> Interest
                  </span>
                </div>
              </div>

              {quotation.paymentBreakdownDescription && (
                <div className="loanpage-notes">
                  <p className="loanpage-notes-title">Financing Notes</p>
                  <p>{quotation.paymentBreakdownDescription}</p>
                </div>
              )}

              <p className="text-muted loanpage-disclaimer">
                This is a standard rate estimate. Contact Advench Realty for the official quotation. Actual loan approval is subject
                to lender assessment.
              </p>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/property/${selectedProperty.id}`)}
              >
                View Property
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
