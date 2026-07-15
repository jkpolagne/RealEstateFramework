import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '../../components/property-seeker/TopNav';
import { LoanCalculatorModal } from '../../components/property-seeker/LoanCalculatorModal';

export function PropertySeekerLayout() {
  const [loanCalculatorOpen, setLoanCalculatorOpen] = useState(false);

  return (
    <div className="property-seeker-layout">
      <TopNav onOpenLoanCalculator={() => setLoanCalculatorOpen(true)} />
      <main className="property-seeker-main">
        <Outlet />
      </main>
      {loanCalculatorOpen && <LoanCalculatorModal onClose={() => setLoanCalculatorOpen(false)} />}
    </div>
  );
}
