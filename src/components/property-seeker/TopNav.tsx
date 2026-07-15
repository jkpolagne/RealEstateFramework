import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';

interface TopNavProps {
  onOpenLoanCalculator: () => void;
}

export function TopNav({ onOpenLoanCalculator }: TopNavProps) {
  const { comparedIds } = useCompare();

  return (
    <header className="top-nav">
      <div className="container top-nav-inner">
        <Link to="/" className="top-nav-brand">
          <span className="top-nav-brand-mark">R</span>
          <span>
            <strong>RealPortal</strong>
            <span className="text-muted top-nav-brand-sub">Advench Realty</span>
          </span>
        </Link>
        <div className="top-nav-actions">
          {comparedIds.length > 0 && (
            <Link to="/compare" className="btn btn-outline-invert btn-sm">
              Compare ({comparedIds.length}/2)
            </Link>
          )}
          <button type="button" className="btn btn-primary" onClick={onOpenLoanCalculator}>
            Loan Calculator
          </button>
        </div>
      </div>
    </header>
  );
}
