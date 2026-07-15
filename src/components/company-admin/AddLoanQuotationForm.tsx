import { useEffect, useMemo, useState } from 'react';
import type { AddLoanQuotationInput, Property } from '../../types';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { addLoanQuotation } from '../../services/loanService';
import { formatPHP } from '../../lib/format';

interface AddLoanQuotationFormProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddLoanQuotationForm({ onClose, onAdded }: AddLoanQuotationFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [interestRate, setInterestRate] = useState('6.5');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [downPaymentAmount, setDownPaymentAmount] = useState('');
  const [termMonths, setTermMonths] = useState('180');
  const [monthlyAmortization, setMonthlyAmortization] = useState('');
  const [paymentBreakdownDescription, setPaymentBreakdownDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touchedDownPayment, setTouchedDownPayment] = useState(false);

  useEffect(() => {
    getAllPropertiesForAdmin().then((result) => {
      setProperties(result);
      if (result.length > 0) setPropertyId(result[0].id);
    });
  }, []);

  const selectedProperty = useMemo(() => properties.find((p) => p.id === propertyId) ?? null, [properties, propertyId]);

  useEffect(() => {
    if (!selectedProperty || touchedDownPayment) return;
    const computed = Math.round(selectedProperty.price * (Number(downPaymentPercent) / 100));
    setDownPaymentAmount(String(computed));
  }, [selectedProperty, downPaymentPercent, touchedDownPayment]);

  useEffect(() => {
    if (!selectedProperty) return;
    setPaymentBreakdownDescription(
      `${downPaymentPercent}% down payment upon reservation, balance financed over ${termMonths} months at ${interestRate}% p.a.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;
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
    await addLoanQuotation(input, selectedProperty);
    setSubmitting(false);
    onAdded();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Loan Quotation</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body scroll-y">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="quote-property">Property</label>
              <select id="quote-property" required value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
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

            <div className="field-row">
              <div className="field">
                <label htmlFor="quote-interest">Interest rate (% p.a.)</label>
                <input
                  id="quote-interest"
                  type="number"
                  min={0}
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
                  required
                  value={downPaymentAmount}
                  onChange={(e) => {
                    setTouchedDownPayment(true);
                    setDownPaymentAmount(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="quote-monthly">Monthly payment (₱)</label>
              <input
                id="quote-monthly"
                type="number"
                min={0}
                required
                value={monthlyAmortization}
                onChange={(e) => setMonthlyAmortization(e.target.value)}
              />
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

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !selectedProperty}>
              {submitting ? 'Adding...' : 'Add Quotation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
