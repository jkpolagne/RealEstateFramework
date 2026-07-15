import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ManualComputationTab } from '../../components/property-seeker/ManualComputationTab';
import { FixedQuotationTab } from '../../components/property-seeker/FixedQuotationTab';

type Tab = 'manual' | 'fixed';

export function LoanComputationPage() {
  const [tab, setTab] = useState<Tab>('manual');

  return (
    <div className="container loanpage">
      <Link to="/" className="loanpage-back">
        ← Back
      </Link>

      <div className="loanpage-header">
        <h1>Loan Computation</h1>
        <p className="text-muted">Estimate your monthly payments or get a detailed quotation for a specific property.</p>
      </div>

      <div className="segmented-tabs">
        <button
          type="button"
          className={`segmented-tab${tab === 'manual' ? ' segmented-tab-active' : ''}`}
          onClick={() => setTab('manual')}
        >
          Manual Computation
        </button>
        <button
          type="button"
          className={`segmented-tab${tab === 'fixed' ? ' segmented-tab-active' : ''}`}
          onClick={() => setTab('fixed')}
        >
          Fixed Quotation
        </button>
      </div>

      {tab === 'manual' ? <ManualComputationTab /> : <FixedQuotationTab />}
    </div>
  );
}
