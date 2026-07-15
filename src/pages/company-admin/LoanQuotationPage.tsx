import { useEffect, useState } from 'react';
import type { LoanQuotation, Property } from '../../types';
import { getAllLoanQuotations } from '../../services/loanService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { AddLoanQuotationForm } from '../../components/company-admin/AddLoanQuotationForm';
import { formatPHP } from '../../lib/format';

export function LoanQuotationPage() {
  const [quotations, setQuotations] = useState<LoanQuotation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  function refresh() {
    setLoading(true);
    Promise.all([getAllLoanQuotations(), getAllPropertiesForAdmin()]).then(([quotationResult, propertyResult]) => {
      setQuotations(quotationResult);
      setProperties(propertyResult);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  function propertyFor(quotation: LoanQuotation): Property | undefined {
    return properties.find((p) => p.id === quotation.propertyId);
  }

  const filtered = quotations.filter((quotation) => {
    if (!search) return true;
    const property = propertyFor(quotation);
    const haystack = `${property?.name ?? ''} ${property?.developerName ?? ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Loan Quotation</h1>
        <p className="text-muted">Fixed financing breakdowns shown to Property Seekers in the loan calculator.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by property or developer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          Add Quotation
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading quotations...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Developer</th>
                <th>Price</th>
                <th>Down Payment</th>
                <th>Interest Rate</th>
                <th>Term</th>
                <th>Monthly Amortization</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted admin-table-empty">
                    No loan quotations match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((quotation) => {
                  const property = propertyFor(quotation);
                  return (
                    <tr key={quotation.id}>
                      <td className="admin-table-name">{property?.name ?? 'Unknown property'}</td>
                      <td>{property?.developerName ?? '—'}</td>
                      <td>{formatPHP(quotation.propertyPrice)}</td>
                      <td>
                        {formatPHP(quotation.downPaymentAmount)} ({quotation.downPaymentPercent}%)
                      </td>
                      <td>{quotation.interestRate}% p.a.</td>
                      <td>{quotation.termMonths} mos</td>
                      <td>{formatPHP(quotation.monthlyAmortization)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <AddLoanQuotationForm onClose={() => setShowAddForm(false)} onAdded={refresh} />}
    </div>
  );
}
