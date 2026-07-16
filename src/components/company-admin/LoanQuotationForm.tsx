import { useEffect, useMemo, useState } from 'react';
import type { AddLoanQuotationInput, LoanQuotation, Property } from '../../types';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { addLoanQuotation, updateLoanQuotation, suggestMonthlyAmortization } from '../../services/loanService';
import { formatPHP } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

interface LoanQuotationFormProps {
  quotation?: LoanQuotation;
  onClose: () => void;
  onSaved: () => void;
}

export function LoanQuotationForm({ quotation, onClose, onSaved }: LoanQuotationFormProps) {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const isEdit = Boolean(quotation);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState(quotation?.propertyId ?? '');
  const [interestRate, setInterestRate] = useState(String(quotation?.interestRate ?? 6.5));
  const [downPaymentPercent, setDownPaymentPercent] = useState(String(quotation?.downPaymentPercent ?? 20));
  const [downPaymentAmount, setDownPaymentAmount] = useState(quotation ? String(quotation.downPaymentAmount) : '');
  const [termMonths, setTermMonths] = useState(String(quotation?.termMonths ?? 180));
  const [monthlyAmortization, setMonthlyAmortization] = useState(quotation ? String(quotation.monthlyAmortization) : '');
  const [paymentBreakdownDescription, setPaymentBreakdownDescription] = useState(quotation?.paymentBreakdownDescription ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchedDownPayment, setTouchedDownPayment] = useState(isEdit);

  useEffect(() => {
    getAllPropertiesForAdmin(companyId).then((result) => {
      setProperties(result);
      if (!isEdit && result.length > 0) setPropertyId(result[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProperty = useMemo(() => properties.find((p) => p.id === propertyId) ?? null, [properties, propertyId]);

  useEffect(() => {
    if (!selectedProperty || touchedDownPayment) return;
    const computed = Math.round(selectedProperty.price * (Number(downPaymentPercent) / 100));
    setDownPaymentAmount(String(computed));
  }, [selectedProperty, downPaymentPercent, touchedDownPayment]);

  useEffect(() => {
    if (!selectedProperty || isEdit) return;
    setPaymentBreakdownDescription(
      `${downPaymentPercent}% down payment upon reservation, balance financed over ${termMonths} months at ${interestRate}% p.a.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id]);

  const preview = useMemo(() => {
    if (!selectedProperty) return null;
    const principal = selectedProperty.price - (Number(downPaymentAmount) || 0);
    const monthly = Number(monthlyAmortization) || 0;
    const totalAmountPayable = monthly * (Number(termMonths) || 0);
    return {
      netLoanAmount: principal,
      totalInterestPaid: totalAmountPayable - principal,
      totalAmountPayable,
    };
  }, [selectedProperty, downPaymentAmount, monthlyAmortization, termMonths]);

  const downPaymentExceedsPrice = Boolean(selectedProperty) && (Number(downPaymentAmount) || 0) > (selectedProperty?.price ?? 0);

  function handleSuggestMonthly() {
    if (!selectedProperty) return;
    const suggestion = suggestMonthlyAmortization(
      selectedProperty.price,
      Number(downPaymentAmount) || 0,
      Number(interestRate) || 0,
      Number(termMonths) || 1,
    );
    setMonthlyAmortization(String(suggestion));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;
    setError(null);
    if (downPaymentExceedsPrice) {
      setError(
        `Down payment (${formatPHP(Number(downPaymentAmount) || 0)}) can't exceed the property price (${formatPHP(selectedProperty.price)}).`,
      );
      return;
    }
    setSubmitting(true);
    const input: AddLoanQuotationInput = {
      propertyId: selectedProperty.id,
      interestRate: Number(interestRate),
      downPaymentPercent: Number(downPaymentPercent),
      downPaymentAmount: Number(downPaymentAmount),
      termMonths: Number(termMonths),
      monthlyAmortization: Number(monthlyAmortization),
      paymentBreakdownDescription,
    };
    try {
      if (isEdit && quotation) {
        await updateLoanQuotation(quotation.id, input, selectedProperty);
      } else {
        await addLoanQuotation(input, selectedProperty);
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
          <h2>{isEdit ? 'Edit Loan Quotation' : 'Add Loan Quotation'}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <fieldset className="admin-fieldset">
              <legend>Property</legend>
              <div className="field">
                <label htmlFor="quote-property">Property</label>
                <select id="quote-property" required value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                  {isEdit && propertyId && !properties.some((p) => p.id === propertyId) && (
                    <option value={propertyId}>Loading...</option>
                  )}
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} — {property.developerName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProperty && (
                <div className="field">
                  <label>Property price</label>
                  <p className="price price-lg">{formatPHP(selectedProperty.price)}</p>
                </div>
              )}
            </fieldset>

            <fieldset className="admin-fieldset">
              <legend>Financing terms</legend>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="quote-interest">Interest rate (% p.a.)</label>
                  <input
                    id="quote-interest"
                    type="number"
                    min={0}
                    max={30}
                    step="0.1"
                    required
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-term">Term (months)</label>
                  <input
                    id="quote-term"
                    type="number"
                    min={1}
                    max={360}
                    required
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="quote-dp-percent">Down payment (%)</label>
                  <input
                    id="quote-dp-percent"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    required
                    value={downPaymentPercent}
                    onChange={(e) => {
                      setTouchedDownPayment(false);
                      setDownPaymentPercent(e.target.value);
                    }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quote-dp-amount">Down payment amount (₱)</label>
                  <input
                    id="quote-dp-amount"
                    type="number"
                    min={0}
                    max={selectedProperty?.price}
                    required
                    aria-invalid={downPaymentExceedsPrice}
                    aria-describedby={downPaymentExceedsPrice ? 'quote-dp-error' : undefined}
                    value={downPaymentAmount}
                    onChange={(e) => {
                      setTouchedDownPayment(true);
                      setDownPaymentAmount(e.target.value);
                    }}
                  />
                  {downPaymentExceedsPrice && (
                    <p id="quote-dp-error" className="field-help field-help-danger">
                      Can't exceed the property price.
                    </p>
                  )}
                </div>
              </div>

              <div className="field">
                <label htmlFor="quote-monthly">Monthly payment (₱)</label>
                <div className="field-row">
                  <input
                    id="quote-monthly"
                    type="number"
                    min={0}
                    required
                    value={monthlyAmortization}
                    onChange={(e) => setMonthlyAmortization(e.target.value)}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleSuggestMonthly} disabled={!selectedProperty}>
                    Suggest
                  </button>
                </div>
                <p className="text-muted field-help">"Suggest" computes a standard amortization from the terms above.</p>
              </div>

              <div className="field">
                <label htmlFor="quote-description">Payment breakdown description</label>
                <textarea
                  id="quote-description"
                  rows={2}
                  value={paymentBreakdownDescription}
                  onChange={(e) => setPaymentBreakdownDescription(e.target.value)}
                />
              </div>
            </fieldset>

            {preview && (
              <fieldset className="admin-fieldset">
                <legend>Computed preview</legend>
                <dl className="quotation-breakdown">
                  <div>
                    <dt>Net loan amount</dt>
                    <dd>{formatPHP(preview.netLoanAmount)}</dd>
                  </div>
                  <div>
                    <dt>Total interest paid</dt>
                    <dd>{formatPHP(preview.totalInterestPaid)}</dd>
                  </div>
                  <div>
                    <dt>Total amount payable</dt>
                    <dd>{formatPHP(preview.totalAmountPayable)}</dd>
                  </div>
                </dl>
              </fieldset>
            )}

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !selectedProperty || downPaymentExceedsPrice}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Quotation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
