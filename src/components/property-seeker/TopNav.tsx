import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';

export function TopNav() {
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
          <Link to="/company-admin" className="btn btn-outline-invert btn-sm">
            Staff Portal
          </Link>
          <Link to="/loan-computation" className="btn btn-primary">
            Loan Calculator
          </Link>
        </div>
      </div>
    </header>
  );
}
